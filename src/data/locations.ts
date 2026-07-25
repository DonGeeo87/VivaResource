export interface Location {
  slug: string;
  name: string;
  nameEs: string;
  county: string;
  countyEs: string;
  latitude: number;
  longitude: number;
  population: number;
  distanceFromPeyton: string;
  description: string;
  descriptionEs: string;
  services: string[];
  servicesEs: string[];
}

export const locations: Location[] = [
  {
    slug: 'peyton',
    name: 'Peyton',
    nameEs: 'Peyton',
    county: 'El Paso County',
    countyEs: 'Condado de El Paso',
    latitude: 39.0639,
    longitude: -104.4619,
    population: 2500,
    distanceFromPeyton: '0 mi',
    description: 'Serving the Peyton community with essential immigrant resources, food assistance, housing support, and community advocacy programs. Our headquarters provides direct services and referrals for families in need.',
    descriptionEs: 'Sirviendo a la comunidad de Peyton con recursos esenciales para inmigrantes, asistencia alimentaria, apoyo de vivienda y programas de defensa comunitaria. Nuestra sede central proporciona servicios directos y referencias para familias necesitadas.',
    services: ['Food Assistance', 'Housing Support', 'Legal Aid Referrals', 'Healthcare Navigation', 'Educational Workshops', 'Emergency Response'],
    servicesEs: ['Asistencia Alimentaria', 'Apoyo de Vivienda', 'Referencias Legales', 'Navegación de Salud', 'Talleres Educativos', 'Respuesta de Emergencia'],
  },
  {
    slug: 'colorado-springs',
    name: 'Colorado Springs',
    nameEs: 'Colorado Springs',
    county: 'El Paso County',
    countyEs: 'Condado de El Paso',
    latitude: 38.8339,
    longitude: -104.8214,
    population: 480000,
    distanceFromPeyton: '30 mi',
    description: 'Providing immigrant resources and community services to the Colorado Springs area. Access food assistance, legal aid referrals, healthcare navigation, and educational workshops near you.',
    descriptionEs: 'Proporcionando recursos para inmigrantes y servicios comunitarios al área de Colorado Springs. Acceda a asistencia alimentaria, referencias legales, navegación de salud y talleres educativos cerca de usted.',
    services: ['Food Assistance', 'Legal Aid Referrals', 'Healthcare Navigation', 'Educational Workshops', 'Community Events', 'Volunteer Opportunities'],
    servicesEs: ['Asistencia Alimentaria', 'Referencias Legales', 'Navegación de Salud', 'Talleres Educativos', 'Eventos Comunitarios', 'Oportunidades de Voluntariado'],
  },
  {
    slug: 'pueblo',
    name: 'Pueblo',
    nameEs: 'Pueblo',
    county: 'Pueblo County',
    countyEs: 'Condado de Pueblo',
    latitude: 38.2544,
    longitude: -104.6091,
    population: 112000,
    distanceFromPeyton: '45 mi',
    description: 'Supporting the Pueblo community with essential resources including food distribution, housing assistance, healthcare access, and educational programs for immigrant families.',
    descriptionEs: 'Apoyando a la comunidad de Pueblo con recursos esenciales que incluyen distribución de alimentos, asistencia de vivienda, acceso a salud y programas educativos para familias inmigrantes.',
    services: ['Food Distribution', 'Housing Assistance', 'Healthcare Access', 'Educational Programs', 'Emergency Support', 'Legal Referrals'],
    servicesEs: ['Distribución de Alimentos', 'Asistencia de Vivienda', 'Acceso a Salud', 'Programas Educativos', 'Apoyo de Emergencia', 'Referencias Legales'],
  },
  {
    slug: 'fountain',
    name: 'Fountain',
    nameEs: 'Fountain',
    county: 'El Paso County',
    countyEs: 'Condado de El Paso',
    latitude: 38.6822,
    longitude: -104.7008,
    population: 29000,
    distanceFromPeyton: '20 mi',
    description: 'Bringing community resources and immigrant support services to Fountain. Food assistance, family programs, and emergency aid available for local residents.',
    descriptionEs: 'Llevando recursos comunitarios y servicios de apoyo para inmigrantes a Fountain. Asistencia alimentaria, programas familiares y ayuda de emergencia disponibles para residentes locales.',
    services: ['Food Assistance', 'Family Programs', 'Emergency Aid', 'Community Workshops', 'Youth Activities', 'Senior Support'],
    servicesEs: ['Asistencia Alimentaria', 'Programas Familiares', 'Ayuda de Emergencia', 'Talleres Comunitarios', 'Actividades Juveniles', 'Apoyo para Adultos Mayores'],
  },
  {
    slug: 'monument',
    name: 'Monument',
    nameEs: 'Monument',
    county: 'El Paso County',
    countyEs: 'Condado de El Paso',
    latitude: 39.0917,
    longitude: -104.8728,
    population: 10000,
    distanceFromPeyton: '25 mi',
    description: 'Extending rural community support to Monument and the surrounding areas. Access food security programs, health resources, and community engagement initiatives.',
    descriptionEs: 'Extendiendo el apoyo comunitario rural a Monument y áreas circundantes. Acceda a programas de seguridad alimentaria, recursos de salud e iniciativas de participación comunitaria.',
    services: ['Food Security', 'Health Resources', 'Community Engagement', 'Educational Workshops', 'Volunteer Programs', 'Emergency Preparedness'],
    servicesEs: ['Seguridad Alimentaria', 'Recursos de Salud', 'Participación Comunitaria', 'Talleres Educativos', 'Programas de Voluntariado', 'Preparación para Emergencias'],
  },
  {
    slug: 'el-paso-county',
    name: 'El Paso County',
    nameEs: 'Condado de El Paso',
    county: 'El Paso County',
    countyEs: 'Condado de El Paso',
    latitude: 38.8325,
    longitude: -104.5254,
    population: 730000,
    distanceFromPeyton: 'County-wide',
    description: 'County-wide services across El Paso County, Colorado. From rural Peyton to Colorado Springs, we provide immigrant resources, food assistance, and community programs for all residents.',
    descriptionEs: 'Servicios en todo el Condado de El Paso, Colorado. Desde Peyton rural hasta Colorado Springs, proporcionamos recursos para inmigrantes, asistencia alimentaria y programas comunitarios para todos los residentes.',
    services: ['County-wide Resources', 'Food Assistance Network', 'Housing Support', 'Healthcare Navigation', 'Legal Aid Referrals', 'Community Programs'],
    servicesEs: ['Recursos en Todo el Condado', 'Red de Asistencia Alimentaria', 'Apoyo de Vivienda', 'Navegación de Salud', 'Referencias Legales', 'Programas Comunitarios'],
  },
];
