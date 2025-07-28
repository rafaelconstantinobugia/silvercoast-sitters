import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Shield, Users, Clock, CheckCircle, XCircle, Plus, Edit, Trash2 } from "lucide-react";
import { EditSitterDialog } from "@/components/admin/EditSitterDialog";
import { toast } from "sonner";

interface Applicant {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  location: string;
  experience_years: string;
  description: string;
  services_offered: string[];
  price_per_day: number;
  emergency_contact: string;
  has_insurance: boolean;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string;
  created_at: string;
}

interface Sitter {
  id: string;
  name: string;
  location: string;
  phone: string;
  email: string;
  description: string;
  services_offered: string[];
  average_rating: number;
  verified: boolean;
  available: boolean;
  experience_years: number;
  price_per_day: number;
  photo_url?: string;
  response_time: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [sitters, setSitters] = useState<Sitter[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      // Check if user is admin by email or user_type
      const { data: userData, error } = await supabase
        .from('users')
        .select('user_type, email')
        .eq('id', user.id)
        .single();

      const isAdminByEmail = user.email === 'r3al4f@gmail.com';
      const isAdminByType = userData?.user_type === 'admin';

      if (isAdminByEmail || isAdminByType) {
        setIsAdmin(true);
        
        // Update user type to admin if accessed by admin email
        if (isAdminByEmail && userData?.user_type !== 'admin') {
          await supabase
            .from('users')
            .update({ user_type: 'admin' })
            .eq('id', user.id);
        }
        
        await Promise.all([
          fetchApplicants(),
          fetchSitters()
        ]);
      } else {
        navigate('/dashboard');
        toast.error('Access denied. Admin privileges required.');
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicants = async () => {
    const { data, error } = await supabase
      .from('applicants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching applicants:', error);
      toast.error('Failed to load applications');
    } else {
      setApplicants((data || []) as Applicant[]);
    }
  };

  const fetchSitters = async () => {
    const { data, error } = await supabase
      .from('sitters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sitters:', error);
      toast.error('Failed to load sitters');
    } else {
      setSitters((data || []) as Sitter[]);
    }
  };

  const handleApproveApplication = async (applicantId: string) => {
    try {
      const { error } = await supabase
        .from('applicants')
        .update({ status: 'approved' })
        .eq('id', applicantId);

      if (error) throw error;
      
      toast.success('Application approved successfully!');
      fetchApplicants();
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Failed to approve application');
    }
  };

  const handleRejectApplication = async (applicantId: string) => {
    try {
      const { error } = await supabase
        .from('applicants')
        .update({ status: 'rejected' })
        .eq('id', applicantId);

      if (error) throw error;
      
      toast.success('Application rejected');
      fetchApplicants();
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    }
  };

  const handleToggleSitterStatus = async (sitterId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('sitters')
        .update({ available: !currentStatus })
        .eq('id', sitterId);

      if (error) throw error;
      
      toast.success(`Sitter ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchSitters();
    } catch (error) {
      console.error('Error updating sitter status:', error);
      toast.error('Failed to update sitter status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Admin privileges required to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage sitters and applications</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Applications</p>
                  <p className="text-2xl font-bold">
                    {applicants.filter(a => a.status === 'pending').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Sitters</p>
                  <p className="text-2xl font-bold">
                    {sitters.filter(s => s.available && s.verified).length}
                  </p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-bold">{applicants.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">All Sitters</p>
                  <p className="text-2xl font-bold">{sitters.length}</p>
                </div>
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="sitters">Manage Sitters</TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Sitter Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {applicants.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No applications yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {applicants.map((applicant) => (
                      <Card key={applicant.id} className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold">
                              {applicant.first_name} {applicant.last_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {applicant.location} • {applicant.experience_years} experience
                            </p>
                          </div>
                          <Badge 
                            variant={applicant.status === 'pending' ? 'secondary' : 
                                   applicant.status === 'approved' ? 'default' : 'destructive'}
                          >
                            {applicant.status}
                          </Badge>
                        </div>

                        <p className="text-sm mb-3">{applicant.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {applicant.services_offered.map((service) => (
                            <Badge key={service} variant="outline">
                              {service.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>

                        <div className="text-sm text-muted-foreground mb-4">
                          <p>Price: €{applicant.price_per_day}/day</p>
                          <p>Phone: {applicant.phone}</p>
                          <p>Emergency: {applicant.emergency_contact}</p>
                          <p>Insurance: {applicant.has_insurance ? 'Yes' : 'No'}</p>
                          <p>Applied: {new Date(applicant.created_at).toLocaleDateString()}</p>
                        </div>

                        {applicant.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              onClick={() => handleApproveApplication(applicant.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectApplication(applicant.id)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sitters Tab */}
          <TabsContent value="sitters">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Manage Sitters</CardTitle>
                  <Button className="bg-ocean-gradient text-white hover:opacity-90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Sitter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {sitters.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No sitters registered yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {sitters.map((sitter) => (
                      <Card key={sitter.id} className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold">{sitter.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {sitter.email} • {sitter.location}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={sitter.verified ? 'default' : 'secondary'}>
                              {sitter.verified ? 'Verified' : 'Unverified'}
                            </Badge>
                            <Badge variant={sitter.available ? 'default' : 'destructive'}>
                              {sitter.available ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-sm mb-3">{sitter.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {sitter.services_offered.map((service) => (
                            <Badge key={service} variant="outline">
                              {service}
                            </Badge>
                          ))}
                        </div>

                        <div className="text-sm text-muted-foreground mb-4">
                          <p>Rating: {sitter.average_rating}/5</p>
                          <p>Experience: {sitter.experience_years} years</p>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleSitterStatus(sitter.id, sitter.available)}
                          >
                            {sitter.available ? 'Deactivate' : 'Activate'}
                          </Button>
                          <EditSitterDialog sitter={sitter} onUpdate={fetchSitters} />
                          <Button size="sm" variant="destructive">
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};