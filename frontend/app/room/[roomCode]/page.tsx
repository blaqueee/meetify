import RoomPage from '@/src/presentation/pages/RoomPage';

export default function Page({ params }: { params: Promise<{ roomCode: string }> }) {
  return <RoomPage params={params} />;
}
