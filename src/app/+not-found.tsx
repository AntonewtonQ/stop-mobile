import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Nao encontrada' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Tela nao encontrada</Text>
        <Link href="/" style={styles.link}>
          Voltar para inicio
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F7F9FB',
  },
  title: {
    color: '#101828',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  link: {
    color: '#0B6E69',
    fontSize: 16,
    fontWeight: '700',
  },
});
