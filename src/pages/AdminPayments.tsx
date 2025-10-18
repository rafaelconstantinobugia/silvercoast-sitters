import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CheckCircle, FileText, DollarSign, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Booking {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
  owner_id: string;
  sitter_id: string;
  created_at: string;
}

export function AdminPayments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [confirmedBookings, setConfirmedBookings] = useState<Booking[]>([]);
  const [inProgressBookings, setInProgressBookings] = useState<Booking[]>([]);
  const [completedBookings, setCompletedBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    checkAdminAndLoadData();
  }, [user, navigate]);

  const checkAdminAndLoadData = async () => {
    try {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user?.id)
        .eq("role", "admin")
        .single();

      if (!roles) {
        toast.error("Acesso não autorizado - Apenas administradores");
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await loadBookings();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao verificar permissões");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      const { data: confirmed } = await (supabase as any)
        .from("bookings")
        .select("*")
        .eq("status", "confirmed")
        .order("created_at", { ascending: false });

      const { data: inProgress } = await (supabase as any)
        .from("bookings")
        .select("*")
        .eq("status", "in_progress")
        .order("created_at", { ascending: false });

      const { data: completed } = await (supabase as any)
        .from("bookings")
        .select("*")
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(20);

      setConfirmedBookings((confirmed as any) || []);
      setInProgressBookings((inProgress as any) || []);
      setCompletedBookings((completed as any) || []);
    } catch (error) {
      console.error("Error loading bookings:", error);
      toast.error("Erro ao carregar reservas");
    }
  };

  const markPaymentReceived = async (bookingId: string, amountCents: number) => {
    try {
      const { error: updateError } = await (supabase as any)
        .from("bookings")
        .update({ status: "in_progress" })
        .eq("id", bookingId);

      if (updateError) throw updateError;

      toast.success("Pagamento confirmado - Reserva em progresso");
      await loadBookings();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao confirmar pagamento");
    }
  };

  const completeBooking = async (bookingId: string) => {
    try {
      const { error } = await (supabase as any)
        .from("bookings")
        .update({ 
          status: "completed",
          completed_at: new Date().toISOString()
        })
        .eq("id", bookingId);

      if (error) throw error;

      toast.success("Reserva concluída com sucesso");
      await loadBookings();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao concluir reserva");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Gestão de Pagamentos</h1>
        <p className="text-muted-foreground">Confirmar pagamentos e gerir reservas</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            <Clock className="h-4 w-4 mr-2" />
            Aguardar Pagamento ({confirmedBookings.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            <FileText className="h-4 w-4 mr-2" />
            Em Progresso ({inProgressBookings.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle className="h-4 w-4 mr-2" />
            Concluídas ({completedBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {confirmedBookings.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                Sem pagamentos pendentes
              </CardContent>
            </Card>
          ) : (
            confirmedBookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Reserva #{booking.id.slice(0, 8)}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date((booking as any).start_ts).toLocaleDateString("pt-PT")} - {new Date((booking as any).end_ts).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                    <Badge variant="secondary">{booking.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => markPaymentReceived(booking.id, 0)}
                    className="w-full"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmar Pagamento Recebido
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {inProgressBookings.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                Sem reservas em progresso
              </CardContent>
            </Card>
          ) : (
            inProgressBookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Reserva #{booking.id.slice(0, 8)}</CardTitle>
                       <p className="text-sm text-muted-foreground">
                         {new Date((booking as any).start_ts).toLocaleDateString("pt-PT")} - {new Date((booking as any).end_ts).toLocaleDateString("pt-PT")}
                       </p>
                    </div>
                    <Badge>{booking.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={() => completeBooking(booking.id)} className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar como Concluída
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedBookings.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                Sem reservas concluídas
              </CardContent>
            </Card>
          ) : (
            completedBookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Reserva #{booking.id.slice(0, 8)}</CardTitle>
                       <p className="text-sm text-muted-foreground">
                        {new Date((booking as any).start_ts).toLocaleDateString("pt-PT")} - {new Date((booking as any).end_ts).toLocaleDateString("pt-PT")}
                       </p>
                    </div>
                    <Badge variant="outline">Concluída</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Concluída</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}