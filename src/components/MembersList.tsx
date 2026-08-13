import React from 'react';

import {
  FlatList,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import EmptyState from './EmptyState';
import type { RoomItem } from '../services/roomMediaService';

type MembersListProps = { members: RoomItem[] };

export default function MembersList({ members }: MembersListProps) {

  return (

    <FlatList
      data={members}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<EmptyState message="No Members Yet" />}

      renderItem={({ item }) => (

        <View style={styles.memberCard}>

          <Text style={styles.memberName}>
            {item.name}
          </Text>

        </View>

      )}
    />

  );

}

const styles = StyleSheet.create({

  memberCard: {
    backgroundColor: '#1c1c1e',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },

  memberName: {
    color: 'white',
    fontSize: 18,
  },

});
