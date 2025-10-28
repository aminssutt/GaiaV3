import imgPillow from '../../images/pillow_massage-removebg-preview.png';
import imgScent from '../../images/scent_diffuser-removebg-preview.png';
import imgAir from '../../images/air_refresh-removebg-preview.png';
import imgShoes from '../../images/shoes-removebg-preview.png';
import imgNeck from '../../images/massage_neck-removebg-preview (1).png';

export const accessories = [
  {
    id: 1,
    name: 'Pillow Massage',
  description: 'Therapeutic massage pillow for comfort',
    price: '$49.99',
    image: imgPillow,
    features: ['Automatic massage', 'Built-in heating', 'Bluetooth connectivity'],
    preview3d: true,
  },
  {
    id: 2,
    name: 'Scent Diffuser',
    description: 'Aroma diffuser to create a relaxing atmosphere',
    price: '$15.99',
    image: imgScent,
    features: ['Color LED', 'Automatic timer', 'Essential oils included'],
    preview3d: true,
  },
  {
    id: 3,
    name: 'Fresh Air Purifier',
    description: 'Portable air purifier for a healthy environment',
    price: '$39.99',
    image: imgAir,
    features: ['HEPA filter', 'Ionization', 'Air quality sensor'],
    preview3d: true,
  },
  {
    id: 4,
    name: 'Shoes Massage',
    description: 'Foot massager shoes for everyday relaxation',
    price: '$59.99',
    image: imgShoes,
    features: ['Multiple intensity levels', 'Ergonomic design', 'Rechargeable'],
    preview3d: true,
  },
  {
    id: 5,
    name: 'Neck Massager',
    description: 'Portable neck massager for stress relief',
    price: '$29.99',
    image: imgNeck,
    features: ['Heat therapy', 'Adjustable fit', 'Lightweight'],
    preview3d: true,
  },
];
