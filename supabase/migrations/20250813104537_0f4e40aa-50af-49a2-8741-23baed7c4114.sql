-- Create favorites table for users to favorite sitters
CREATE TABLE public.favorites (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    sitter_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, sitter_id)
);

-- Enable RLS on favorites table
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for favorites
CREATE POLICY "Users can view their own favorites" 
ON public.favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites" 
ON public.favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
ON public.favorites 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add email field to applicants table
ALTER TABLE public.applicants ADD COLUMN email TEXT;

-- Create notification triggers for new applications and bookings
CREATE OR REPLACE FUNCTION public.notify_new_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Insert a notification record or trigger external webhook
    -- This will log the application event
    INSERT INTO public.admin_notifications (
        type,
        title,
        message,
        data,
        created_at
    ) VALUES (
        'new_application',
        'New Sitter Application',
        'A new sitter application has been submitted from ' || NEW.first_name || ' ' || NEW.last_name,
        jsonb_build_object(
            'applicant_id', NEW.id,
            'first_name', NEW.first_name,
            'last_name', NEW.last_name,
            'email', NEW.email,
            'location', NEW.location
        ),
        now()
    );
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_new_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Insert a notification record for new bookings
    INSERT INTO public.admin_notifications (
        type,
        title,
        message,
        data,
        created_at
    ) VALUES (
        'new_booking',
        'New Booking Request',
        'A new booking request has been submitted for €' || NEW.total_price,
        jsonb_build_object(
            'booking_id', NEW.id,
            'owner_id', NEW.owner_id,
            'service_id', NEW.service_id,
            'total_price', NEW.total_price,
            'start_date', NEW.start_date,
            'end_date', NEW.end_date
        ),
        now()
    );
    RETURN NEW;
END;
$$;

-- Create admin notifications table
CREATE TABLE public.admin_notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin notifications
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for admin notifications (only admins can see them)
CREATE POLICY "Admins can view all notifications" 
ON public.admin_notifications 
FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.user_type = 'admin'
));

-- Create triggers
CREATE TRIGGER trigger_notify_new_application
    AFTER INSERT ON public.applicants
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_new_application();

CREATE TRIGGER trigger_notify_new_booking
    AFTER INSERT ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_new_booking();

-- Update sitters table to have services relationship
CREATE TABLE public.sitter_services_mapping (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    sitter_id UUID NOT NULL,
    service_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(sitter_id, service_id)
);

-- Enable RLS
ALTER TABLE public.sitter_services_mapping ENABLE ROW LEVEL SECURITY;

-- Create policies for sitter services mapping
CREATE POLICY "Anyone can view sitter services mapping" 
ON public.sitter_services_mapping 
FOR SELECT 
USING (true);

CREATE POLICY "Sitters can manage their own services mapping" 
ON public.sitter_services_mapping 
FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.sitters 
    WHERE sitters.id = sitter_services_mapping.sitter_id 
    AND sitters.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all sitter services mapping" 
ON public.sitter_services_mapping 
FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.user_type = 'admin'
));

-- Function to get sitters filtered by service
CREATE OR REPLACE FUNCTION public.get_sitters_by_service(service_id_param UUID)
RETURNS TABLE(
    id UUID,
    name TEXT,
    location TEXT,
    photo_url TEXT,
    average_rating NUMERIC,
    verified BOOLEAN,
    available BOOLEAN,
    price_per_day NUMERIC,
    description TEXT,
    experience_years INTEGER,
    response_time TEXT
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
    SELECT DISTINCT 
        s.id,
        s.name,
        s.location,
        s.photo_url,
        s.average_rating,
        s.verified,
        s.available,
        s.price_per_day,
        s.description,
        s.experience_years,
        s.response_time
    FROM public.sitters s
    LEFT JOIN public.sitter_services_mapping ssm ON s.id = ssm.sitter_id
    WHERE s.verified = true 
        AND s.available = true
        AND (service_id_param IS NULL OR ssm.service_id = service_id_param)
    ORDER BY s.average_rating DESC;
$$;