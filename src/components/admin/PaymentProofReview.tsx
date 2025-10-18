import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, CheckCircle } from "lucide-react";

interface PaymentProof {
  bookingId: string;
  proofUrl: string;
  uploadedAt: string;
  amount: number;
}

interface PaymentProofReviewProps {
  proofs: PaymentProof[];
  onApprove: (bookingId: string, amount: number) => void;
}

export function PaymentProofReview({ proofs, onApprove }: PaymentProofReviewProps) {
  const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null);

  return (
    <div className="space-y-4">
      {proofs.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Sem comprovativos pendentes de revisão
          </CardContent>
        </Card>
      ) : (
        proofs.map((proof) => (
          <Card key={proof.bookingId}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Reserva #{proof.bookingId.slice(0, 8)}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Enviado em {new Date(proof.uploadedAt).toLocaleString("pt-PT")}
                  </p>
                </div>
                <Badge variant="secondary">Pendente</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-2xl font-bold">€{(proof.amount / 100).toFixed(2)}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedProof(proof)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Comprovativo
                </Button>
                <Button
                  onClick={() => onApprove(proof.bookingId, proof.amount)}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprovar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <Dialog open={!!selectedProof} onOpenChange={() => setSelectedProof(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Comprovativo de Pagamento</DialogTitle>
          </DialogHeader>
          {selectedProof && (
            <div className="overflow-auto">
              {selectedProof.proofUrl.endsWith('.pdf') ? (
                <embed
                  src={selectedProof.proofUrl}
                  type="application/pdf"
                  className="w-full h-[600px]"
                />
              ) : (
                <img
                  src={selectedProof.proofUrl}
                  alt="Comprovativo de pagamento"
                  className="w-full h-auto"
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}