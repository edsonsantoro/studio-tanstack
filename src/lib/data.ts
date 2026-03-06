import type { UserProfile } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getUserImage = (id: string) => {
  const img = PlaceHolderImages.find((p) => p.id === id);
  return {
    url: img?.imageUrl || `https://picsum.photos/seed/${id}/100/100`,
    hint: img?.imageHint || 'avatar portrait',
  };
};

export const mockUsers: UserProfile[] = [
  { id: 'user1', name: 'João S.', city: 'São Paulo', country: 'Brasil', avatarUrl: getUserImage('user1').url, imageHint: getUserImage('user1').hint, bio: '', tags: [], isTraveler: false, coords: { lat: -23.55, lng: -46.63 }, languages: ['Português', 'Inglês'] },
  { id: 'user2', name: 'Maria L.', city: 'Lisboa', country: 'Portugal', avatarUrl: getUserImage('user2').url, imageHint: getUserImage('user2').hint, bio: '', tags: [], isTraveler: true, coords: { lat: 38.72, lng: -9.14 }, languages: ['Português'] },
  { id: 'user3', name: 'John D.', city: 'New York', country: 'USA', avatarUrl: getUserImage('user3').url, imageHint: getUserImage('user3').hint, bio: '', tags: [], isTraveler: false, coords: { lat: 40.71, lng: -74.00 }, languages: ['English'] },
  { id: 'user4', name: 'Ana P.', city: 'Rio de Janeiro', country: 'Brasil', avatarUrl: getUserImage('user4').url, imageHint: getUserImage('user4').hint, bio: '', tags: [], isTraveler: false, coords: { lat: -22.90, lng: -43.17 }, languages: ['Português'] },
  { id: 'user5', name: 'David C.', city: 'London', country: 'UK', avatarUrl: getUserImage('user5').url, imageHint: getUserImage('user5').hint, bio: '', tags: [], isTraveler: false, coords: { lat: 51.50, lng: -0.12 }, languages: ['English', 'Mandarin'] },
  { id: 'user6', name: 'Elena M.', city: 'Madrid', country: 'España', avatarUrl: getUserImage('user6').url, imageHint: getUserImage('user6').hint, bio: '', tags: [], isTraveler: true, coords: { lat: 40.41, lng: -3.70 }, languages: ['Español', 'English'] },
  { id: 'user7', name: 'Peter J.', city: 'Sydney', country: 'Australia', avatarUrl: getUserImage('user7').url, imageHint: getUserImage('user7').hint, bio: '', tags: [], isTraveler: false, coords: { lat: -33.86, lng: 151.20 }, languages: ['English'] },
  { id: 'user8', name: 'Sophia R.', city: 'Toronto', country: 'Canada', avatarUrl: getUserImage('user8').url, imageHint: getUserImage('user8').hint, bio: '', tags: [], isTraveler: false, coords: { lat: 43.65, lng: -79.38 }, languages: ['English', 'French'] },
  { id: 'user9', name: 'Carlos F.', city: 'Buenos Aires', country: 'Argentina', avatarUrl: getUserImage('user9').url, imageHint: getUserImage('user9').hint, bio: '', tags: [], isTraveler: false, coords: { lat: -34.60, lng: -58.38 }, languages: ['Español'] },
  { id: 'user10', name: 'Laura B.', city: 'Berlin', country: 'Germany', avatarUrl: getUserImage('user10').url, imageHint: getUserImage('user10').hint, bio: '', tags: [], isTraveler: true, coords: { lat: 52.52, lng: 13.40 }, languages: ['Deutsch', 'English'] },
  { id: 'user11', name: 'Kenji T.', city: 'Tokyo', country: 'Japan', avatarUrl: getUserImage('user11').url, imageHint: getUserImage('user11').hint, bio: '', tags: [], isTraveler: false, coords: { lat: 35.67, lng: 139.65 }, languages: ['日本語', 'English'] },
  { id: 'user12', name: 'Fatima A.', city: 'Cairo', country: 'Egypt', avatarUrl: getUserImage('user12').url, imageHint: getUserImage('user12').hint, bio: '', tags: [], isTraveler: false, coords: { lat: 30.04, lng: 31.23 }, languages: ['العربية', 'English'] },
  { id: 'user13', name: 'Andrés G.', city: 'Bogotá', country: 'Colombia', avatarUrl: getUserImage('user13').url, imageHint: getUserImage('user13').hint, bio: '', tags: [], isTraveler: false, coords: { lat: 4.71, lng: -74.07 }, languages: ['Español'] },
  { id: 'user14', name: 'Isabelle D.', city: 'Paris', country: 'France', avatarUrl: getUserImage('user14').url, imageHint: getUserImage('user14').hint, bio: '', tags: [], isTraveler: true, coords: { lat: 48.85, lng: 2.35 }, languages: ['Français', 'English'] },
  { id: 'user15', name: 'Liam O.', city: 'Dublin', country: 'Ireland', avatarUrl: getUserImage('user15').url, imageHint: getUserImage('user15').hint, bio: '', tags: [], isTraveler: false, coords: { lat: 53.34, lng: -6.26 }, languages: ['English', 'Gaeilge'] },
];

export const realUsers: UserProfile[] = [
    { id: 'user1', name: 'João da Silva', city: 'São Paulo', country: 'Brasil', avatarUrl: getUserImage('user1').url, imageHint: getUserImage('user1').hint, bio: 'Apaixonado por missões e por conectar pessoas ao coração de Deus.', tags: ['Graduado EPS', 'Disponível para mentorar', 'Missões'], isTraveler: false, coords: { lat: -23.55, lng: -46.63 }, whatsAppLink: 'https://wa.me/5511999999999', instagramLink: 'https://instagram.com/joao', languages: ['Português', 'Inglês'] },
    { id: 'user2', name: 'Maria Lima', city: 'Lisboa', country: 'Portugal', avatarUrl: getUserImage('user2').url, imageHint: getUserImage('user2').hint, bio: 'Viajando pela Europa e buscando encontrar a comunidade local.', tags: ['Viajante/Missionário', 'Novo na comunidade'], isTraveler: true, coords: { lat: 38.72, lng: -9.14 }, languages: ['Português', 'Espanhol'] },
    { id: 'user3', name: 'John Doe', city: 'New York', country: 'USA', avatarUrl: getUserImage('user3').url, imageHint: getUserImage('user3').hint, bio: 'Líder de um grupo de estudo bíblico em casa.', tags: ['Líder de grupo local', 'Estudo bíblico', 'Anfitrião (recebe visitas)'], isTraveler: false, coords: { lat: 40.71, lng: -74.00 }, instagramLink: 'https://instagram.com/john', languages: ['English'] },
    { id: 'user4', name: 'Ana Pereira', city: 'Rio de Janeiro', country: 'Brasil', avatarUrl: getUserImage('user4').url, imageHint: getUserImage('user4').hint, bio: 'Recém-chegada na comunidade, animada para conhecer a todos!', tags: ['Novo na comunidade', 'Buscando mentoria'], isTraveler: false, coords: { lat: -22.90, lng: -43.17 }, whatsAppLink: 'https://wa.me/5521999999999', languages: ['Português'] },
    { id: 'user5', name: 'David Chen', city: 'London', country: 'UK', avatarUrl: getUserImage('user5').url, imageHint: getUserImage('user5').hint, bio: 'Ex-membro da Comunidade Sem Limites, agora morando em Londres.', tags: ['Ex-Comunidade Sem Limites', 'Adoração'], isTraveler: false, coords: { lat: 51.50, lng: -0.12 }, languages: ['English', 'Mandarin'] },
    { id: 'user6', name: 'Elena Rodriguez', city: 'Madrid', country: 'España', avatarUrl: getUserImage('user6').url, imageHint: getUserImage('user6').hint, bio: 'Missionária em treinamento, passando um tempo em Madrid.', tags: ['Viajante/Missionário', 'Intercessão'], isTraveler: true, coords: { lat: 40.41, lng: -3.70 }, blogLink: 'https://elena.blog', languages: ['Español', 'English', 'Português'] },
];

export const pendingUsers = [
    { id: 'pending1', name: 'Carlos Ferreira', email: 'carlos.f@example.com', city: 'Curitiba', country: 'Brasil', avatarUrl: getUserImage('user9').url, bio: 'Gostaria de me juntar à comunidade para crescer espiritualmente.' },
    { id: 'pending2', name: 'Laura Becker', email: 'laura.b@example.com', city: 'Munique', country: 'Alemanha', avatarUrl: getUserImage('user10').url, bio: 'Sou estudante e nova na fé.' },
    { id: 'pending3', name: 'Kenji Tanaka', email: 'kenji.t@example.com', city: 'Osaka', country: 'Japão', avatarUrl: getUserImage('user11').url, bio: 'Conheci os ensinamentos de Reinhard Hirtler online e quero me conectar.' },
];
