import { Book } from '@/contexts/CartContext';

export const books: Book[] = [
  {
    id: '1',
    title: 'Imihango n\'Imigenzo n\'Imiziririzo mu Rwanda',
    shortDescription: 'A comprehensive study of Rwandan customs, traditions, and taboos.',
    description: 'This seminal work by Bishop Aloys Bigirumwami explores the rich tapestry of Rwandan cultural traditions, customs, and taboos. Written with deep scholarly insight and pastoral sensitivity, the book serves as an invaluable resource for understanding pre-colonial Rwandan society and its spiritual foundations. It documents ceremonies, social norms, and the wisdom passed down through generations of Rwandans.',
    price: 35.00,
    coverImage: '/placeholder.svg',
    year: 1964,
    pages: 280,
    language: 'Kinyarwanda'
  },
  {
    id: '2',
    title: 'Indirimbo z\'Ubuhamya',
    shortDescription: 'A collection of sacred hymns and spiritual songs.',
    description: 'Bishop Bigirumwami\'s collection of sacred hymns represents a beautiful fusion of Catholic liturgical tradition with Rwandan musical sensibilities. These hymns have been sung in churches across Rwanda for decades, touching the hearts of believers and enriching Catholic worship with authentic African expression. The collection includes songs for various liturgical seasons and sacramental celebrations.',
    price: 25.00,
    coverImage: '/placeholder.svg',
    year: 1958,
    pages: 156,
    language: 'Kinyarwanda'
  },
  {
    id: '3',
    title: 'Inkuru y\'Ubukristu mu Rwanda',
    shortDescription: 'The history of Christianity in Rwanda.',
    description: 'This historical account traces the arrival and development of Christianity in Rwanda, from the first missionaries to the establishment of the local Church. Bishop Bigirumwami provides firsthand insights as one of the key figures in Rwanda\'s Catholic history, documenting the challenges, triumphs, and transformations of faith in the land of a thousand hills.',
    price: 40.00,
    coverImage: '/placeholder.svg',
    year: 1971,
    pages: 320,
    language: 'Kinyarwanda'
  },
  {
    id: '4',
    title: 'Amasomo yo mu Bwiru',
    shortDescription: 'Teachings from the sacred traditions.',
    description: 'A profound exploration of traditional Rwandan wisdom and its intersection with Christian faith. Bishop Bigirumwami masterfully bridges the gap between indigenous spirituality and Catholic teaching, showing how the best of Rwandan tradition can be illuminated by the Gospel message. This work remains essential reading for understanding inculturation in African Christianity.',
    price: 30.00,
    coverImage: '/placeholder.svg',
    year: 1966,
    pages: 210,
    language: 'Kinyarwanda'
  },
  {
    id: '5',
    title: 'Pastoral Letters Collection',
    shortDescription: 'A compilation of pastoral letters to the faithful.',
    description: 'Throughout his episcopate, Bishop Bigirumwami wrote numerous pastoral letters addressing the spiritual and social needs of his flock. This collection brings together his most significant letters, covering topics from faith formation to social justice, offering timeless guidance rooted in Gospel values and adapted to the Rwandan context.',
    price: 28.00,
    coverImage: '/placeholder.svg',
    year: 1975,
    pages: 240,
    language: 'Kinyarwanda/French'
  },
  {
    id: '6',
    title: 'Igitabo cy\'Amasengesho',
    shortDescription: 'A prayer book for Rwandan Catholics.',
    description: 'This beloved prayer book has been a companion to countless Rwandan Catholics in their spiritual journey. Bishop Bigirumwami compiled traditional Catholic prayers alongside original compositions that speak to the Rwandan heart. The book includes prayers for daily life, family devotions, and special occasions, all presented in beautiful Kinyarwanda.',
    price: 18.00,
    coverImage: '/placeholder.svg',
    year: 1960,
    pages: 128,
    language: 'Kinyarwanda'
  }
];

export const getBookById = (id: string): Book | undefined => {
  return books.find(book => book.id === id);
};

export const searchBooks = (query: string): Book[] => {
  const lowerQuery = query.toLowerCase();
  return books.filter(book =>
    book.title.toLowerCase().includes(lowerQuery) ||
    book.description.toLowerCase().includes(lowerQuery) ||
    book.shortDescription.toLowerCase().includes(lowerQuery)
  );
};
