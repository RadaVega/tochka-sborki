import {
  RocketLaunch, Student, Buildings, Handshake, Microscope,
  GitBranch, Brain, Wrench, Globe, Target, Users, Package,
  Server, CreditCard, Lightning, SignIn, PlayCircle, Sparkle,
  TrendUp, Briefcase, CheckCircle, Question, DoorOpen, Article,
  ClipboardText, UserPlus, Trophy, Lightbulb, Code, ShareNetwork,
  Bank, Factory, Heart, Cpu, Stack, Compass, Shield, Lock,
  Envelope, Phone, MapPin, Calendar, Clock, Star, ArrowRight,
  CaretRight, List, X, MagnifyingGlass, Flask, Gear, Planet,
  Orbit, Atom, Telescope, Robot, Circuitry, ChartLineUp,
  CloudArrowUp, Database, ShieldCheck, Fingerprint, Infinity,
  Pulse, Radioactive, Planet as PlanetIcon, Asterisk, WaveSine
} from '@phosphor-icons/react';

const iconMap = {
  RocketLaunch, Student, Buildings, Handshake, Microscope,
  GitBranch, Brain, Wrench, Globe, Target, Users, Package,
  Server, CreditCard, Lightning, SignIn, PlayCircle, Sparkle,
  TrendUp, Briefcase, CheckCircle, Question, DoorOpen, Article,
  ClipboardText, UserPlus, Trophy, Lightbulb, Code, ShareNetwork,
  Bank, Factory, Heart, Cpu, Stack, Compass, Shield, Lock,
  Envelope, Phone, MapPin, Calendar, Clock, Star, ArrowRight,
  CaretRight, List, X, MagnifyingGlass, Flask, Gear, Planet,
  Orbit, Atom, Telescope, Robot, Circuitry, ChartLineUp,
  CloudArrowUp, Database, ShieldCheck, Fingerprint, Infinity,
  Pulse, Radioactive, PlanetIcon, Asterisk, WaveSine
};

export function Icon({ name, size = 20, weight = "duotone", className = '', ...props }) {
  const Component = iconMap[name];
  if (!Component) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  return <Component size={size} weight={weight} className={className} {...props} />;
}