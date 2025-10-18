import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Upload, FileText, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Booking {
  id: string;
  status: string;
  start_ts: string;
  end_ts: string;
  sitter_id: string;
  owner_id: string;
  created_at: string;
  notes: string | null;
}

export function OwnerInvoices() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    fetchBookings();
  }, [user, navigate]);

  const fetchBookings = async () => {
    try {
      // @ts-ignore - Type instantiation depth
      const { data, error } = await supabase
        .from('bookings_new')
        .select('*')
        .eq('owner_id', user?.id)
        .in('status', ['confirmed', 'in_progress', 'completed'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      // @ts-ignore - Type mismatch between old and new schema
      setBookings(data || []);
    } catch (error) {
      console.error("Error loading bookings:", error);
      toast.error("Erro ao carregar reservas");
    } finally {
      setLoading(false);
    }
  };

  const uploadPaymentProof = async (bookingId: string, file: File) => {
    setUploadingFor(bookingId);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${bookingId}-${Date.now()}.${fileExt}`;
      const filePath = `payment-proofs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('payments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('payments')
        .getPublicUrl(filePath);

      // Store proof URL in booking notes or separate payment_proofs table
      // @ts-ignore - Table name type mismatch
      const { error: updateError } = await supabase
        .from("bookings_new")
        .update({ 
          notes: `Comprovativo de pagamento: ${publicUrl}`
        })
        .eq("id", bookingId);

      if (updateError) throw updateError;

      toast.success("Comprovativo enviado com sucesso");
      // @ts-ignore - Type instantiation depth
      await fetchBookings();
    } catch (error) {
      console.error("Error uploading proof:", error);
      toast.error("Erro ao enviar comprovativo");
    } finally {
      setUploadingFor(null);
    }
  };

  const handleFileSelect = (bookingId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadPaymentProof(bookingId, file);
    }
  };

  const getPaymentInstructions = () => {
    return `
**Métodos de Pagamento:**

**MB WAY:**
Número: 912 345 678
Referência: Reserva #[ID]

**Transferência Bancária:**
IBAN: PT50 0000 0000 0000 0000 0000 0
Referência: Reserva #[ID]

Após efetuar o pagamento, carregue o comprovativo abaixo.
    `.trim();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Minhas Faturas</h1>
        <p className="text-muted-foreground">Gerir pagamentos das reservas</p>
      </div>

      <div className="space-y-6">
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Sem faturas pendentes</p>
            </CardContent>
          </Card>
        ) : (
          bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Reserva #{booking.id.slice(0, 8)}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {new Date(booking.start_ts).toLocaleDateString("pt-PT")} - {new Date(booking.end_ts).toLocaleDateString("pt-PT")}
                    </p>
                  </div>
                  <Badge variant={booking.status === "confirmed" ? "secondary" : "default"}>
                    {booking.status === "confirmed" ? "Aguardar Pagamento" : booking.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {booking.status === "confirmed" && (
                  <>
                    <div className="bg-muted p-4 rounded-md">
                      <p className="text-sm font-medium mb-2">Instruções de Pagamento</p>
                      <div className="text-sm whitespace-pre-line">
                        {getPaymentInstructions().replace('[ID]', booking.id.slice(0, 8))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`proof-${booking.id}`} className="text-sm font-medium">
                        Carregar Comprovativo de Pagamento
                      </Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id={`proof-${booking.id}`}
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileSelect(booking.id, e)}
                          disabled={uploadingFor === booking.id}
                          className="flex-1"
                        />
                        <Button disabled={uploadingFor === booking.id}>
                          {uploadingFor === booking.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Formatos aceites: JPG, PNG, PDF
                      </p>
                    </div>
                  </>
                )}

                {booking.status === "in_progress" && (
                  <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md p-4">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      ✓ Pagamento confirmado - Reserva em progresso
                    </p>
                  </div>
                )}

                {booking.status === "completed" && (
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      ✓ Reserva concluída
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}