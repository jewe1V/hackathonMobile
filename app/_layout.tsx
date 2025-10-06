import { Stack } from "expo-router";

const StackLayout = () => {
  return (
      <Stack>
        <Stack.Screen
            name="index"
            options={{ headerShown: false }}
        />
          <Stack.Screen
              name="(login)/LoginScreen"
              options={{ headerShown: false }}
          />
      </Stack>
  );
}

export default StackLayout;
