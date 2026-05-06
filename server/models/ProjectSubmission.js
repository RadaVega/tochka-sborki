import mongoose from 'mongoose';

const projectSubmissionSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    contactName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    stack: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    budget: { type: String, required: true, trim: true },
    deadline: { type: Date, required: true }
  },
  { timestamps: true }
);

export const ProjectSubmission = mongoose.models.ProjectSubmission || mongoose.model('ProjectSubmission', projectSubmissionSchema);
