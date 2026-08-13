import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

export default function Header() {
  return (
    <View style={styles.header}>

      {/* TOP ROW */}
      <View style={styles.topRow}>

        <Ionicons
          name="arrow-back"
          size={30}
          color="white"
        />

        <View style={styles.iconsContainer}>

          <Pressable style={styles.iconButton}>
            <Ionicons
              name="search"
              size={20}
              color="white"
            />
          </Pressable>

          <Pressable style={styles.iconButton}>
            <Ionicons
              name="notifications"
              size={20}
              color="white"
            />
          </Pressable>

          <Pressable style={styles.iconButton}>
            <Ionicons
              name="settings"
              size={20}
              color="white"
            />
          </Pressable>

        </View>

      </View>

      {/* PROFILE */}
      <View style={styles.profileSection}>

        <View style={styles.profileImageWrapper}>

          <Image
            source={require('../../assets/Halim.png')}
            style={styles.profileImage}
          />

          <View style={styles.statusBadge}>
            <View style={styles.statusOnline} />
          </View>

        </View>

        <View>

          <Text style={styles.username}>
            HalimMsbah
          </Text>

          <Text style={styles.subText}>
            Halimmsbah
          </Text>

        </View>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  header: {
    marginTop: 5,
    paddingHorizontal: 16,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },

  iconButton: {
    backgroundColor: '#333',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 15,
    marginBottom: 10,
  },

  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },

  profileImageWrapper: {
    width: 70,
    height: 70,
    position: 'relative',
  },

  statusBadge: {
    position: 'absolute',
    right: 0,
    bottom: -1,
    width: 20,
    height: 20,
    borderRadius: 8,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusOnline: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#23a55a',
  },

  username: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },

  subText: {
    color: 'gray',
    fontSize: 16,
    marginTop: 2,
  },

});
