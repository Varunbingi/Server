import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';

const userSchema = new Schema({
    fullName: {
        type: String,
        required: [true, "Fullname required"],
        minLength: [5, "Name must have a minimum of 5 characters"],
        maxLength: [20, "Name must be less than 20 characters"],
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email required'],
        unique: [true, "Email already registered"],
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        select: false,
        required: [true, 'Password required'],
        minLength: [8, 'Password must be at least 8 characters']
    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER' 
    },
    avatar: {
        public_id: {
            type: String,
        },
        secure_url: {
            type: String,
        }
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: String 
}, { timestamps: true });

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) { 
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function(plainText) {
    if (!plainText || !this.password) {
        return false; // Return false if either plaintext or hashed password is not provided
    }
    return await bcrypt.compare(plainText, this.password);
};


userSchema.methods.generateJWTToken = async function() {
    return JWT.sign(
        {
            id: this._id,
            role: this.role,
            email: this.email,
            // subscription: this.subscription, 
        },
        process.env.JWT_SECRET,
        {
            expiresIn:'24h'
        }
    );
};

const User = model('User', userSchema);

export default User;