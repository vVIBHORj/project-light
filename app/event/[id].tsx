import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { EventDetailView } from '../../src/features/events';
import { mockUsers } from '../../src/data/mocks/seedData';

export default function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentUser = mockUsers[0]; // Aisha Rao

  return (
    <EventDetailView
      eventId={id || 'event_1'}
      currentUser={currentUser}
      onBack={() => router.back()}
      onNavigateToCircle={(circleId) => router.push(`/circle/${circleId}`)}
      onConnectWithAttendee={(_userId, name) => {
        router.push({
          pathname: '/(tabs)/messages',
          params: { connectName: name },
        });
      }}
    />
  );
}
