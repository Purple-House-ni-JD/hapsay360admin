import { Officer, PoliceStation } from "../models/index.js";

export const createPoliceStation = async (req, res) => {
    try {
        const { name, address, phone_number, email, landline, latitude, longitude } = req.body;
        
        if(!name || !address || !phone_number || !landline) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const newPoliceStation = new PoliceStation(
            { name, 
              address, 
              contact: { phone_number, email, landline },
              location: { latitude, longitude }
            });

        await newPoliceStation.save();
        
        res.status(201).json({
            success: true,
            data: newPoliceStation
        });

    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};


export const getStations = async (req, res) => {
    try {
        const stations = await PoliceStation.find().populate('officer_IDs', '-password');
        res.status(200).json({
            success: true,
            data: stations
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};

export const updatePoliceStation = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, phone_number, email, landline, latitude, longitude } = req.body;
        
        if(!name || !address || !phone_number || !landline) {
            return res.status(400).json({ error: "All required fields must be provided" });
        }

        const updateData = {
            name,
            address,
            contact: {
                phone_number,
                email,
                landline
            },
            location: {
                latitude,
                longitude
            },
            updated_at: Date.now()
        };

        const updatedStation = await PoliceStation.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedStation) {
            return res.status(404).json({ 
                success: false,
                error: 'Station not found' 
            });
        }

        res.status(200).json({
            success: true,
            message: 'Station updated successfully',
            data: updatedStation
        });

    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};

export const deletePoliceStation = async (req, res) => {
    try {
        console.log('🔴 DELETE ROUTE HIT!'); // Add this
        console.log('Station ID:', req.params.id); // Add this
        
        const { id } = req.params;
        
        const deletedStation = await PoliceStation.findByIdAndDelete(id);

        if (!deletedStation) {
            console.log('❌ Station not found'); // Add this
            return res.status(404).json({ 
                success: false,
                error: 'Station not found' 
            });
        }

        console.log('✅ Station deleted:', deletedStation.name); // Add this

        // Optional: Remove station reference from associated officers
        await Officer.updateMany(
            { station_ID: id },
            { $unset: { station_ID: "" } }
        );

        res.status(200).json({
            success: true,
            message: 'Station deleted successfully',
            data: deletedStation
        });

    } catch (error) {
        console.error('❌ Delete error:', error); // Add this
        res.status(500).json({ 
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};
