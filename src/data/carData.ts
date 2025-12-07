// Popular car manufacturers and their models
export const carMakes = [
  'Audi',
  'BMW',
  'Ford',
  'Honda',
  'Hyundai',
  'Kia',
  'Mazda',
  'Mercedes-Benz',
  'Nissan',
  'Opel',
  'Peugeot',
  'Renault',
  'Škoda',
  'Toyota',
  'Volkswagen',
  'Volvo',
].sort();

export const carModels: Record<string, string[]> = {
  'Audi': ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron'],
  'BMW': ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7', 'i3', 'i4', 'iX'],
  'Ford': ['Fiesta', 'Focus', 'Mondeo', 'Mustang', 'Kuga', 'Puma', 'Explorer'],
  'Honda': ['Civic', 'Accord', 'CR-V', 'HR-V', 'Jazz', 'e'],
  'Hyundai': ['i10', 'i20', 'i30', 'Tucson', 'Kona', 'Santa Fe', 'Ioniq 5'],
  'Kia': ['Picanto', 'Rio', 'Ceed', 'Sportage', 'Niro', 'Sorento', 'EV6'],
  'Mazda': ['2', '3', '6', 'CX-3', 'CX-5', 'CX-30', 'CX-60', 'MX-5'],
  'Mercedes-Benz': ['A-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLC', 'GLE', 'EQA', 'EQC'],
  'Nissan': ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Leaf'],
  'Opel': ['Corsa', 'Astra', 'Insignia', 'Crossland', 'Grandland', 'Mokka'],
  'Peugeot': ['208', '308', '408', '508', '2008', '3008', '5008', 'e-208'],
  'Renault': ['Clio', 'Megane', 'Captur', 'Kadjar', 'Arkana', 'Zoe'],
  'Škoda': ['Fabia', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq', 'Enyaq'],
  'Toyota': ['Yaris', 'Corolla', 'Camry', 'RAV4', 'C-HR', 'Highlander', 'Prius', 'bZ4X'],
  'Volkswagen': ['Polo', 'Golf', 'Passat', 'Tiguan', 'T-Roc', 'Touareg', 'ID.3', 'ID.4'],
  'Volvo': ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90', 'C40'],
};

// Generate years from current year down to 1990
const currentYear = new Date().getFullYear();
export const carYears = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);
