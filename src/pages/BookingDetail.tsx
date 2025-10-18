import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Clock, MapPin, Phone, Mail, MessageSquare, FileText } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface Booking {
  id: string;
  status: string;
  start_ts: string;
  end_ts: string;
  address_text?: string;
  notes?: string;
  amount_cents?: number;
  hourly_rate_cents?: number;
  customer_id: string;
  sitter_id: string;
  created_at: string;
}

interface Profile {
  full_name?: string;
  avatar_url?: string;
  phone?: string;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [customerProfile, setCustomerProfile] = useState<Profile | null>(null);
  const [sitterProfile, setSitterProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchBookingDetails();
  }, [id, user]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);

      // Fetch booking
      const { data: bookingData, error: bookingError } = await (supabase as any)
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();

      if (bookingError) throw bookingError;

      // Verify user has access to this booking
      if (bookingData.customer_id !== user?.id && bookingData.sitter_id !== user?.id) {
        toast.error('You do not have access to this booking');
        navigate('/dashboard');
        return;
      }

      setBooking(bookingData as any);

      // Fetch customer profile
      const { data: customerData } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, phone')
        .eq('id', bookingData.customer_id)
        .single();

      setCustomerProfile(customerData);

      // Fetch sitter profile
      const { data: sitterData } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, phone')
        .eq('id', bookingData.sitter_id)
        .single();

      setSitterProfile(sitterData);

      // Fetch messages
      const { data: messagesData } = await (supabase as any)
        .from('messages')
        .select('*')
        .eq('booking_id', id)
        .order('created_at', { ascending: true });

      setMessages((messagesData as any) || []);

    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast.error('Erro ao carregar detalhes da reserva');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      setSending(true);

      const { data, error } = await supabase.functions.invoke('post-message', {
        body: {
          booking_id: id,
          content: newMessage.trim()
        }
      });

      if (error) throw error;

      setMessages([...messages, data.message]);
      setNewMessage('');
      toast.success('Mensagem enviada');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'secondary' },
      awaiting_payment: { label: 'Aguardando Pagamento', variant: 'warning' },
      awaiting_payment_review: { label: 'Em Revisão', variant: 'default' },
      in_progress: { label: 'Em Progresso', variant: 'default' },
      completed: { label: 'Concluído', variant: 'success' },
      cancelled: { label: 'Cancelado', variant: 'destructive' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const isSitter = user?.id === booking?.sitter_id;
  const isCustomer = user?.id === booking?.customer_id;
  const otherProfile = isSitter ? customerProfile : sitterProfile;
  const otherName = otherProfile?.full_name || 'Usuário';

  // Contact masking: only show full contact after booking is accepted
  const showFullContact = booking?.status !== 'pending';

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto p-6">
        <p>Reserva não encontrada</p>
      </div>
    );
  }

  const hours = booking.start_ts && booking.end_ts 
    ? Math.ceil((new Date(booking.end_ts).getTime() - new Date(booking.start_ts).getTime()) / (1000 * 60 * 60))
    : 0;

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Booking Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Detalhes da Reserva</CardTitle>
                {getStatusBadge(booking.status)}
              </div>
              <CardDescription>
                Criada em {format(new Date(booking.created_at), 'dd/MM/yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Datas</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(booking.start_ts), 'dd/MM/yyyy HH:mm')} -{' '}
                    {format(new Date(booking.end_ts), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Duração</p>
                  <p className="text-sm text-muted-foreground">{hours} horas</p>
                </div>
              </div>

              {booking.address_text && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Local</p>
                    <p className="text-sm text-muted-foreground">{booking.address_text}</p>
                  </div>
                </div>
              )}

              {booking.notes && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Notas</p>
                    <p className="text-sm text-muted-foreground">{booking.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Mensagens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhuma mensagem ainda. Comece a conversa!
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${
                        msg.sender_id === user?.id ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <div
                        className={`rounded-lg p-3 max-w-[80%] ${
                          msg.sender_id === user?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {format(new Date(msg.created_at), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Separator />

              <div className="flex gap-2">
                <Textarea
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="min-h-[80px]"
                />
                <Button onClick={sendMessage} disabled={sending || !newMessage.trim()}>
                  Enviar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {isSitter ? 'Cliente' : 'Cuidador'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={otherProfile?.avatar_url} />
                  <AvatarFallback>{otherName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{otherName}</p>
                  {!showFullContact && (
                    <p className="text-xs text-muted-foreground">
                      Contacto disponível após confirmação
                    </p>
                  )}
                </div>
              </div>

              {showFullContact && otherProfile?.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  <span>{otherProfile.phone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Price Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo do Valor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Taxa horária</span>
                <span>€{((booking.hourly_rate_cents || 0) / 100).toFixed(2)}/h</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Duração</span>
                <span>{hours}h</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>€{((booking.amount_cents || 0) / 100).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
