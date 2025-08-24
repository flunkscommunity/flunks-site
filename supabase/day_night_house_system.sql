-- Time-based House Images System
-- Create table to manage day/night house configurations

-- Houses table with day/night image support
CREATE TABLE IF NOT EXISTS house_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    house_id VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'jocks-house', 'preps-house'
    house_name VARCHAR(100) NOT NULL,
    day_image_url TEXT NOT NULL,
    night_image_url TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time configuration table
CREATE TABLE IF NOT EXISTS time_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    config_name VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'default', 'summer', 'winter'
    day_start_hour INTEGER NOT NULL DEFAULT 6, -- 6 AM
    night_start_hour INTEGER NOT NULL DEFAULT 20, -- 8 PM
    timezone VARCHAR(50) NOT NULL DEFAULT 'America/Chicago',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to get current Central Time
CREATE OR REPLACE FUNCTION get_central_time()
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE sql
AS $$
    SELECT NOW() AT TIME ZONE 'America/Chicago';
$$;

-- Function to check if it's day or night
CREATE OR REPLACE FUNCTION is_day_time()
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    current_hour INTEGER;
    config RECORD;
BEGIN
    -- Get the active time configuration
    SELECT day_start_hour, night_start_hour 
    INTO config
    FROM time_config 
    WHERE is_active = true 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- Default to 6 AM - 8 PM if no config found
    IF config IS NULL THEN
        config.day_start_hour := 6;
        config.night_start_hour := 20;
    END IF;
    
    -- Get current hour in Central Time
    current_hour := EXTRACT(HOUR FROM get_central_time());
    
    -- Check if it's day time
    RETURN current_hour >= config.day_start_hour AND current_hour < config.night_start_hour;
END;
$$;

-- Function to get the appropriate image for a house
CREATE OR REPLACE FUNCTION get_house_image(house_id_param VARCHAR)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    house_record RECORD;
    is_day BOOLEAN;
BEGIN
    -- Get house images
    SELECT day_image_url, night_image_url
    INTO house_record
    FROM house_images
    WHERE house_id = house_id_param AND is_active = true;
    
    IF house_record IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Check if it's day or night
    is_day := is_day_time();
    
    -- Return appropriate image
    IF is_day THEN
        RETURN house_record.day_image_url;
    ELSE
        RETURN house_record.night_image_url;
    END IF;
END;
$$;

-- View that returns all houses with their current appropriate image
CREATE OR REPLACE VIEW house_images_current AS
SELECT 
    hi.house_id,
    hi.house_name,
    hi.description,
    CASE 
        WHEN is_day_time() THEN hi.day_image_url
        ELSE hi.night_image_url
    END as current_image_url,
    hi.day_image_url,
    hi.night_image_url,
    is_day_time() as is_day_time,
    get_central_time() as current_central_time
FROM house_images hi
WHERE hi.is_active = true;

-- Insert default time configuration
INSERT INTO time_config (config_name, day_start_hour, night_start_hour, timezone, is_active)
VALUES ('default', 6, 20, 'America/Chicago', true)
ON CONFLICT (config_name) DO NOTHING;

-- Insert sample house data and campus buildings
INSERT INTO house_images (house_id, house_name, day_image_url, night_image_url, description) VALUES
('jocks-house', 'Jocks House', '/images/houses/jocks-house-day.jpg', '/images/houses/jocks-house-night.jpg', 'Athletic house during day and night'),
('preps-house', 'Preps House', '/images/houses/preps-house-day.jpg', '/images/houses/preps-house-night.jpg', 'Preppy house during day and night'),
('geeks-house', 'Geeks House', '/images/houses/geeks-house-day.jpg', '/images/houses/geeks-house-night.jpg', 'Tech house during day and night'),
('freaks-house', 'Freaks House', '/images/houses/freaks-house-day.jpg', '/images/houses/freaks-house-night.jpg', 'Alternative house during day and night'),
('high-school', 'High School', '/images/buildings/high-school-day.jpg', '/images/buildings/high-school-night.jpg', 'Main school building with day and night atmosphere'),
('arcade', 'Arcade', '/images/buildings/arcade-day.jpg', '/images/buildings/arcade-night.jpg', 'Classic arcade with neon lights that shine at night')
ON CONFLICT (house_id) DO NOTHING;

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_house_images_updated_at BEFORE UPDATE ON house_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_time_config_updated_at BEFORE UPDATE ON time_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
