import Officer from '../models/Officer.js'; 
import PoliceStation from '../models/PoliceStation.js'; 

// Get all officers
export const getAllOfficers = async (req, res) => {
    try {
        const officers = await Officer.find()
            .populate('station_id', 'name address') // Populate station details
            .select('-password') // Exclude password from response
            .sort({ created_at: -1 });

        res.status(200).json({
            success: true,
            data: officers,
            count: officers.length
        });
    } catch (error) {
        console.error('Error fetching officers:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching officers',
            error: error.message
        });
    }
};

// Get single officer by ID
export const getOfficerById = async (req, res) => {
    try {
        const officer = await Officer.findById(req.params.id)
            .populate('station_id', 'name address contact')
            .select('-password');

        if (!officer) {
            return res.status(404).json({
                success: false,
                message: 'Officer not found'
            });
        }

        res.status(200).json({
            success: true,
            data: officer
        });
    } catch (error) {
        console.error('Error fetching officer:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching officer',
            error: error.message
        });
    }
};

// Create new officer
export const createOfficer = async (req, res) => {
    try {
        const {
            email,
            password,
            first_name,
            last_name,
            badge_number,
            rank,
            station_id,
            contact,
            status
        } = req.body;

        // Check if email already exists
        const existingOfficer = await Officer.findOne({ email });
        if (existingOfficer) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Check if badge number already exists (if provided)
        if (badge_number) {
            const existingBadge = await Officer.findOne({ badge_number });
            if (existingBadge) {
                return res.status(400).json({
                    success: false,
                    message: 'Badge number already exists'
                });
            }
        }

        // Verify station exists if station_id is provided
        if (station_id) {
            const stationExists = await PoliceStation.findById(station_id);
            if (!stationExists) {
                return res.status(404).json({
                    success: false,
                    message: 'Station not found'
                });
            }
        }

        // Create new officer
        const officer = new Officer({
            email,
            password,
            first_name,
            last_name,
            badge_number,
            rank,
            station_id,
            contact,
            status: status || 'active'
        });

        await officer.save();

        // Return officer without password
        const officerData = await Officer.findById(officer._id)
            .populate('station_id', 'name address')
            .select('-password');

        res.status(201).json({
            success: true,
            message: 'Officer created successfully',
            data: officerData
        });
    } catch (error) {
        console.error('Error creating officer:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating officer',
            error: error.message
        });
    }
};

// Update officer
export const updateOfficer = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Remove password from update data if it's empty or not being changed
        if (!updateData.password) {
            delete updateData.password;
        }

        // If badge number is being updated, check if it's unique
        if (updateData.badge_number) {
            const existingBadge = await Officer.findOne({
                badge_number: updateData.badge_number,
                _id: { $ne: id }
            });
            if (existingBadge) {
                return res.status(400).json({
                    success: false,
                    message: 'Badge number already exists'
                });
            }
        }

        // Verify station exists if station_id is being updated
        if (updateData.station_id) {
            const stationExists = await PoliceStation.findById(updateData.station_id);
            if (!stationExists) {
                return res.status(404).json({
                    success: false,
                    message: 'Station not found'
                });
            }
        }

        updateData.updated_at = Date.now();

        const officer = await Officer.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
            .populate('station_id', 'name address')
            .select('-password');

        if (!officer) {
            return res.status(404).json({
                success: false,
                message: 'Officer not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Officer updated successfully',
            data: officer
        });
    } catch (error) {
        console.error('Error updating officer:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating officer',
            error: error.message
        });
    }
};

// Delete officer
export const deleteOfficer = async (req, res) => {
    try {
        const officer = await Officer.findByIdAndDelete(req.params.id);

        if (!officer) {
            return res.status(404).json({
                success: false,
                message: 'Officer not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Officer deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting officer:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting officer',
            error: error.message
        });
    }
};

// Get officers by station
export const getOfficersByStation = async (req, res) => {
    try {
        const { stationId } = req.params;

        const officers = await Officer.find({ station_id: stationId })
            .populate('station_id', 'name address')
            .select('-password')
            .sort({ rank: 1, last_name: 1 });

        res.status(200).json({
            success: true,
            data: officers,
            count: officers.length
        });
    } catch (error) {
        console.error('Error fetching officers by station:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching officers',
            error: error.message
        });
    }
};

// Update officer status
export const updateOfficerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'inactive', 'suspended'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        const officer = await Officer.findByIdAndUpdate(
            id,
            { status, updated_at: Date.now() },
            { new: true }
        )
            .populate('station_id', 'name address')
            .select('-password');

        if (!officer) {
            return res.status(404).json({
                success: false,
                message: 'Officer not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Officer status updated successfully',
            data: officer
        });
    } catch (error) {
        console.error('Error updating officer status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating officer status',
            error: error.message
        });
    }
};