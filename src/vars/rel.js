export const predbs = [
  {
    name: '1,000 empresas más grandes por ingresos en 2017 (total patrimonio)',
    description: 'Empresas fantasma definitivas',
    country: 'COL',
    blockEdit: true,
    countryLabel: 'Colombia',
    author: 'Superintendencia de Sociedades: www.supersociedades.gov.co',
    size: 3,
    slug: 'sat-favorables',
    last: '2019-11-01',
    url: "http://www.supersociedades.gov.co",
    flag: require('../static/flags/colombia.svg'),
    file: require('../static/csvs/col-patrimonio-2017.csv'),
    only: [
      'Nombre de empresa',
      'RUT',
      'Entidad Federativa',
      'Supervisor',
      'Macrosector'
    ]
  },
  {
    name: 'Estafa Maestra',
    country: 'MEX',
    countryLabel: 'México',
    author: 'Animal Político & Mexicanos Contra la Corrupción',
    size: 2,
    slug: 'estafa-maestra',
    last: '2019-11-01',
    url: "https://animalpolitico.com/estafa-maestra",
    flag: require('../static/flags/mexico.svg'),
    file: require('../static/csvs/estafa-maestra.csv')
  },
  {
    name: 'Empresas Fantasma de Veracruz',
    country: 'MEX',
    countryLabel: 'México',
    author: 'Animal Político',
    size: 1,
    blockEdit: true,
    slug: 'estafa-maestra',
    last: '2019-10-01',
    url: "https://www.animalpolitico.com/las-empresas-fantasma-de-veracruz",
    flag: require('../static/flags/mexico.svg'),
    file: require('../static/csvs/empresas-fantasma-ver.csv')
  },
  {
    name: 'La Red Karime-Duarte',
    country: 'MEX',
    countryLabel: 'México',
    author: 'Animal Político',
    size: 1,
    blockEdit: true,
    slug: 'estafa-maestra',
    last: '2019-10-01',
    url: "https://www.animalpolitico.com/red-karime-duarte/duarte-entrego-millonarios-recursos.html",
    flag: require('../static/flags/mexico.svg'),
    file: require('../static/csvs/red-karime-duarte.csv')
  },
  {
    name: 'SAT Definitivos',
    description: 'Empresas fantasma definitivas',
    country: 'MEX',
    blockEdit: true,
    countryLabel: 'México',
    author: 'SAT',
    size: 5,
    slug: 'sat-definitivos',
    last: '2019-10-08',
    url: "http://omawww.sat.gob.mx/cifras_sat/Paginas/datos/vinculo.html?page=ListCompleta69B.html",
    flag: require('../static/flags/mexico.svg'),
    file: require('../static/csvs/sat-def.csv'),
    only: [
      'Nombre de empresa',
      'RFC'
    ]
  },
  {
    name: 'SAT Presuntos',
    description: 'Empresas fantasma definitivas',
    country: 'MEX',
    blockEdit: true,
    countryLabel: 'México',
    author: 'SAT',
    size: 3,
    slug: 'sat-definitivos',
    last: '2019-10-08',
    url: "http://omawww.sat.gob.mx/cifras_sat/Paginas/datos/vinculo.html?page=ListCompleta69B.html",
    flag: require('../static/flags/mexico.svg'),
    file: require('../static/csvs/sat-pre.csv'),
    only: [
      'Nombre de empresa',
      'RFC'
    ]
  },
  {
    name: 'SAT Desvirtuados',
    description: 'Empresas fantasma definitivas',
    country: 'MEX',
    blockEdit: true,
    countryLabel: 'México',
    author: 'SAT',
    size: 3,
    slug: 'sat-Desvirtuados',
    last: '2019-10-08',
    url: "http://omawww.sat.gob.mx/cifras_sat/Paginas/datos/vinculo.html?page=ListCompleta69B.html",
    flag: require('../static/flags/mexico.svg'),
    file: require('../static/csvs/sat-desvirtuados.csv'),
    only: [
      'Nombre de empresa',
      'RFC'
    ]
  },
  {
    name: 'SAT Favorables',
    description: 'Empresas fantasma definitivas',
    country: 'MEX',
    blockEdit: true,
    countryLabel: 'México',
    author: 'SAT',
    size: 3,
    slug: 'sat-favorables',
    last: '2019-10-08',
    url: "http://omawww.sat.gob.mx/cifras_sat/Paginas/datos/vinculo.html?page=ListCompleta69B.html",
    flag: require('../static/flags/mexico.svg'),
    file: require('../static/csvs/sat-favorables.csv'),
    only: [
      'Nombre de empresa',
      'RFC'
    ]
  },
  {
    name: 'Privilegios Fiscales Condonados (2007-2015)',
    country: 'MEX',
    countryLabel: 'México',
    blockEdit: true,
    author: 'Fundar',
    size: 20,
    slug: 'estafa-maestra',
    last: '2019-09-30',
    url: "https://privilegiosfiscales.fundar.org.mx/#top",
    flag: require('../static/flags/mexico.svg'),
    file: require('../static/csvs/pf-7-15.csv'),
    only: [
      'Nombre de empresa',
      'RFC',
      'Monto condonado',
      'Representante legal',
    ]
  },
  {
    name: 'Privilegios Fiscales Cancelaciones (2007-2015)',
    country: 'MEX',
    countryLabel: 'México',
    blockEdit: true,
    author: 'Fundar',
    size: 20,
    slug: 'estafa-maestra',
    last: '2019-09-30',
    url: "https://privilegiosfiscales.fundar.org.mx/#top",
    flag: require('../static/flags/mexico.svg'),
    file: require('../static/csvs/pf-cancelaciones-715.csv'),
    only: [
      'Nombre de empresa',
      'RFC',
      'Monto cancelado',
      'Representante legal',
    ]
  },
  {
    name: 'Registro Único de Proveedores y Contratistas (RUPC)',
    description: 'Empresas fantasma definitivas',
    country: 'MEX',
    blockEdit: true,
    countryLabel: 'México',
    author: 'Secretaría de Hacienda y Crédito Público',
    size: 11,
    slug: 'sat-Desvirtuados',
    last: '2019-11-05',
    url: "https://cnet.hacienda.gob.mx/servicios/consultaRUPC.jsf",
    flag: require('../static/flags/mexico.svg'),
    file: require('../static/csvs/rupc.csv'),
    only: [
      'Nombre de empresa',
      'RFC',
      'Entidad Federativa',
      'Giro',
      'Sitio web'
    ]
  },

]
