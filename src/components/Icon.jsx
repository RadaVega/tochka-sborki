import {
  Rocket, Users, Building2, BrainCircuit, Wrench, Globe,
  Microscope, GitBranch, GraduationCap, Target, Package,
  Server, CreditCard, Zap, LogIn, PlayCircle, HeartHandshake,
  Bot, Sparkles, TrendingUp, Briefcase, CheckCircle2,
  HelpCircle, DoorOpen, FileText, ClipboardList, UserPlus,
  Award, Lightbulb, Code2, Share2, Landmark, Factory,
  Heart, Cpu, Layers, Compass, Shield, Lock, Mail, Phone,
  MapPin, Calendar, Clock, Star, ArrowRight, ChevronRight,
  Menu, X, Search, Beaker, Cog, Orbit
} from 'lucide-react';

const iconMap = {
  Rocket, Users, Building2, BrainCircuit, Wrench, Globe,
  Microscope, GitBranch, GraduationCap, Target, Package,
  Server, CreditCard, Zap, LogIn, PlayCircle, HeartHandshake,
  Bot, Sparkles, TrendingUp, Briefcase, CheckCircle2,
  HelpCircle, DoorOpen, FileText, ClipboardList, UserPlus,
  Award, Lightbulb, Code2, Share2, Landmark, Factory,
  Heart, Cpu, Layers, Compass, Shield, Lock, Mail, Phone,
  MapPin, Calendar, Clock, Star, ArrowRight, ChevronRight,
  Menu, X, Search, Beaker, Cog, Orbit
};

export function Icon({ name, size = 20, className = '', ...props }) {
  const Component = iconMap[name];
  if (!Component) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  return <Component size={size} className={className} {...props} />;
}