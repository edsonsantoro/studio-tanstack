import { PlaceHolderImages } from './placeholder-images';

export interface CoursePackage {
  id: string;
  title: string;
  description: string;
  price: string;
  features: string[];
  imageUrl: string;
  imageHint: string;
}

const getCourseImage = (id: string) => {
    const img = PlaceHolderImages.find((p) => p.id === id);
    return {
        url: img?.imageUrl || `https://picsum.photos/seed/${id}/400/250`,
        hint: img?.imageHint || 'course content',
    };
};

export const coursePackages: CoursePackage[] = [
  {
    id: 'foundations',
    title: 'Série Fundamentos da Vida Cristã',
    description: 'Construa uma base sólida para sua fé com esta série essencial que cobre os pilares do cristianismo.',
    price: 'R$ 89,90',
    features: ['15 vídeos de ensino', 'Material de apoio em PDF', 'Acesso vitalício'],
    imageUrl: getCourseImage('course-foundations').url,
    imageHint: getCourseImage('course-foundations').hint,
  },
  {
    id: 'maturity',
    title: 'Série Maturidade Espiritual',
    description: 'Vá além do básico e aprofunde seu relacionamento com Deus, aprendendo a ouvir Sua voz e a seguir Sua vontade.',
    price: 'R$ 119,90',
    features: ['20 vídeos de ensino aprofundado', 'Guia de reflexão pessoal', 'Acesso vitalício'],
    imageUrl: getCourseImage('course-maturity').url,
    imageHint: getCourseImage('course-maturity').hint,
  },
  {
    id: 'marriage',
    title: 'Série Casamento Inabalável',
    description: 'Fortaleça seu casamento com princípios bíblicos práticos sobre comunicação, intimidade e propósito.',
    price: 'R$ 149,90',
    features: ['18 vídeos para casais', 'Exercícios práticos para fazer a dois', 'Acesso vitalício'],
    imageUrl: getCourseImage('course-marriage').url,
    imageHint: getCourseImage('course-marriage').hint,
  },
];
