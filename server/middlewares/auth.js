import User from '../models/User.js';

export const protect = async(req, res, next)=>{
    try{
        const {userId} = await req.auth()
        if(!userId){
            return res.json({success: false, message: "not authenticated" })
        }
        next()
    }catch(error){
        res.json({success: false, message: error.message })
    }
}

export const authorizeRoles = (...roles) => {
    return async (req, res, next) => {
        try {
            const {userId} = await req.auth()
            if(!userId) return res.json({ success: false, message: "not authenticated" });
            
            const user = await User.findById(userId);
            if (!user) {
                return res.json({ success: false, message: 'User not found' });
            }

            if (!roles.includes(user.role)) {
                return res.json({ success: false, message: `Role: ${user.role} is not allowed to access this resource` });
            }
            next();
        } catch (error) {
            res.json({ success: false, message: error.message });
        }
    };
};