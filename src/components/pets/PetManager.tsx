import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, PawPrint } from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age_years?: number;
  weight_kg?: number;
  special_needs?: string;
}

export function PetManager() {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    species: 'dog',
    breed: '',
    age_years: '',
    weight_kg: '',
    special_needs: ''
  });

  useEffect(() => {
    if (user) {
      fetchPets();
    }
  }, [user]);

  const fetchPets = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('pets')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPets(data || []);
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const petData = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed || null,
        age_years: formData.age_years ? parseInt(formData.age_years) : null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        special_needs: formData.special_needs || null,
        owner_id: user?.id
      };

      if (editingPet) {
        const { error } = await (supabase as any)
          .from('pets')
          .update(petData)
          .eq('id', editingPet.id);

        if (error) throw error;
        toast.success('Pet atualizado com sucesso!');
      } else {
        const { error } = await (supabase as any)
          .from('pets')
          .insert(petData);

        if (error) throw error;
        toast.success('Pet adicionado com sucesso!');
      }

      setDialogOpen(false);
      setEditingPet(null);
      resetForm();
      fetchPets();
    } catch (error) {
      console.error('Error saving pet:', error);
      toast.error('Erro ao salvar pet');
    }
  };

  const handleDelete = async (petId: string) => {
    if (!confirm('Tem certeza que deseja remover este pet?')) return;

    try {
      const { error } = await (supabase as any)
        .from('pets')
        .delete()
        .eq('id', petId);

      if (error) throw error;
      toast.success('Pet removido com sucesso');
      fetchPets();
    } catch (error) {
      console.error('Error deleting pet:', error);
      toast.error('Erro ao remover pet');
    }
  };

  const openEditDialog = (pet: Pet) => {
    setEditingPet(pet);
    setFormData({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      age_years: pet.age_years?.toString() || '',
      weight_kg: pet.weight_kg?.toString() || '',
      special_needs: pet.special_needs || ''
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      species: 'dog',
      breed: '',
      age_years: '',
      weight_kg: '',
      special_needs: ''
    });
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingPet(null);
      resetForm();
    }
  };

  if (loading) {
    return <div>Carregando pets...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Meus Pets</h2>
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Pet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPet ? 'Editar Pet' : 'Adicionar Novo Pet'}
              </DialogTitle>
              <DialogDescription>
                Adicione informações sobre seu pet
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="species">Espécie *</Label>
                <Select
                  value={formData.species}
                  onValueChange={(value) => setFormData({ ...formData, species: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dog">Cão</SelectItem>
                    <SelectItem value="cat">Gato</SelectItem>
                    <SelectItem value="bird">Pássaro</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="breed">Raça</Label>
                <Input
                  id="breed"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Idade (anos)</Label>
                  <Input
                    id="age"
                    type="number"
                    min="0"
                    value={formData.age_years}
                    onChange={(e) => setFormData({ ...formData, age_years: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.weight_kg}
                    onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="special_needs">Necessidades Especiais</Label>
                <Textarea
                  id="special_needs"
                  value={formData.special_needs}
                  onChange={(e) => setFormData({ ...formData, special_needs: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingPet ? 'Salvar' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {pets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PawPrint className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Você ainda não adicionou nenhum pet
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Primeiro Pet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <Card key={pet.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{pet.name}</CardTitle>
                    <CardDescription>
                      {pet.species === 'dog' && 'Cão'}
                      {pet.species === 'cat' && 'Gato'}
                      {pet.species === 'bird' && 'Pássaro'}
                      {pet.species === 'other' && 'Outro'}
                      {pet.breed && ` • ${pet.breed}`}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(pet)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(pet.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {pet.age_years && <p>Idade: {pet.age_years} anos</p>}
                  {pet.weight_kg && <p>Peso: {pet.weight_kg} kg</p>}
                  {pet.special_needs && (
                    <p className="text-muted-foreground">
                      Necessidades: {pet.special_needs}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
