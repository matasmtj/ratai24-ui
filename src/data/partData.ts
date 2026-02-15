// Part categories structure
export const partCategories = [
  { id: 1, nameEn: 'Lighting System', nameLt: 'Apšvietimo sistema', icon: '💡', parentId: null },
  { id: 2, nameEn: 'Fuel System', nameLt: 'Degalų mišinio sistema', icon: '⛽', parentId: null },
  { id: 3, nameEn: 'Painting System', nameLt: 'Dujų išmetimo sistema', icon: '🎨', parentId: null },
  { id: 4, nameEn: 'Doors', nameLt: 'Durys', icon: '🚪', parentId: null },
  { id: 5, nameEn: 'Rear Axle', nameLt: 'Galinė ašis', icon: '🔩', parentId: null },
  { id: 6, nameEn: 'Rear Exterior Details', nameLt: 'Galinės išorės detalės', icon: '🚗', parentId: null },
  { id: 7, nameEn: 'Other Details', nameLt: 'Kitos detalės', icon: '⚙️', parentId: null },
  { id: 8, nameEn: 'Body Parts/Panels', nameLt: 'Kėbulas/kėbulo dalys/kablys', icon: '⛟', parentId: null },
  { id: 9, nameEn: 'Air Conditioning/Heating System/Radiator', nameLt: 'Oro kondicionavimo-šildymo sistema/radiatoriai', icon: '🌡️', parentId: null },
  { id: 10, nameEn: 'Suspension/Junctions/Transmission', nameLt: 'Pavarų dėžė/sankaba/transmisija', icon: '🛞', parentId: null },
  { id: 11, nameEn: 'Front Axle', nameLt: 'Priekinė ašis', icon: '🔧', parentId: null },
  { id: 12, nameEn: 'Front Exterior Details', nameLt: 'Priekinės išorės detalės', icon: '🚙', parentId: null },
  { id: 13, nameEn: 'Dashboards/Connectors/Electric System', nameLt: 'Prietaisai/jungikliai/el. sistema', icon: '📊', parentId: null },
  { id: 14, nameEn: 'Tires/Wheels/Caps', nameLt: 'Ratai/padangos/gaubtai', icon: '🛞', parentId: null },
  { id: 15, nameEn: 'Interior/Interiors', nameLt: 'Salonas/interjeras', icon: '💺', parentId: null },
];

// Subcategories for Doors (id: 4)
export const doorSubcategories = [
  { id: 401, nameEn: 'Front Door Complete', nameLt: 'Priekinio el. lango pakėlimo mechanizmo komplektas', parentId: 4 },
  { id: 402, nameEn: 'Front Door Mechanism', nameLt: 'Priekinis el. lango pakėlimo mechanizmas be varikliuko', parentId: 4 },
  { id: 403, nameEn: 'Front Door Handle', nameLt: 'Priekinė durų spyna', parentId: 4 },
  { id: 404, nameEn: 'Manual Window Handle', nameLt: 'Rankena atidarymo išorinė', parentId: 4 },
  { id: 405, nameEn: 'Power Window Motor', nameLt: 'Veidrodėlis (elektra valdomas)', parentId: 4 },
  { id: 406, nameEn: 'Rear Door Complete', nameLt: 'El. Lango pakėlimo mechanizmo komplektas', parentId: 4 },
  { id: 407, nameEn: 'Rear Door Glass', nameLt: 'Galinių durų spyna', parentId: 4 },
  { id: 408, nameEn: 'Rear Door Lock', nameLt: 'Galinės durys', parentId: 4 },
];

// Common car parts
export const commonPartNames = [
  // Engine
  'Engine Block',
  'Cylinder Head',
  'Pistons',
  'Crankshaft',
  'Camshaft',
  'Timing Belt',
  'Oil Pump',
  'Water Pump',
  'Alternator',
  'Starter Motor',
  
  // Transmission
  'Gearbox',
  'Clutch Kit',
  'Flywheel',
  'CV Joint',
  'Drive Shaft',
  
  // Suspension
  'Shock Absorber',
  'Spring',
  'Control Arm',
  'Ball Joint',
  'Stabilizer Link',
  'Wheel Bearing',
  
  // Brakes
  'Brake Disc',
  'Brake Pad',
  'Brake Caliper',
  'Brake Master Cylinder',
  'Brake Servo',
  
  // Steering
  'Steering Rack',
  'Power Steering Pump',
  'Tie Rod End',
  'Steering Column',
  
  // Body
  'Front Bumper',
  'Rear Bumper',
  'Hood',
  'Fender',
  'Front Door',
  'Rear Door',
  'Trunk Lid',
  'Headlight',
  'Tail Light',
  'Side Mirror',
  'Windshield',
  
  // Interior
  'Dashboard',
  'Steering Wheel',
  'Seats',
  'Door Panel',
  'Center Console',
  'Instrument Cluster',
  
  // Electrical
  'ECU (Engine Control Unit)',
  'ABS Module',
  'Fuse Box',
  'Wiring Harness',
  'Battery',
  
  // Exhaust
  'Catalytic Converter',
  'Muffler',
  'Exhaust Manifold',
  'Lambda Sensor',
  
  // Cooling
  'Radiator',
  'Cooling Fan',
  'Thermostat',
  'Expansion Tank',
  
  // Fuel System
  'Fuel Pump',
  'Fuel Injector',
  'Fuel Tank',
  'Fuel Filter',
].sort();

// Years range for parts (typically older than current cars)
const currentYear = new Date().getFullYear();
export const partYears = Array.from({ length: currentYear - 1979 }, (_, i) => currentYear - i);
