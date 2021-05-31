/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
} from 'react-native';
import Geolocation, {
  GeolocationOptions,
  GeolocationResponse,
  GeolocationError,
} from '@react-native-community/geolocation';
//import regionMonitor from 'react-native-region-monitor';
import {point as makePoint} from '@turf/helpers';
import distance from '@turf/distance';
import Sound from 'react-native-sound';

import NativeRegionMonitor, {LatLong} from './NativeRegionMonitor';
import {useResource, ResourceState} from './useResource';
import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [gpsResource] = useResource<GeolocationResponse>(
    () => getPosition(),
    [],
  );

  const [positionState, setPositionState] = React.useState<{
    result: GeolocationResponse | null;
    error: GeolocationError | null;
    isLoading: boolean;
    regions: Set<string>;
  }>({
    result: null,
    error: null,
    isLoading: true,
    regions: new Set(),
  });
  React.useEffect(() => {
    const id = Geolocation.watchPosition(
      async position => {
        const regions = await NativeRegionMonitor.checkRegionsForCoordinate(
          position.coords,
        );
        console.log('current regions', regions);
        setPositionState({
          result: position,
          error: null,
          isLoading: false,
          regions: new Set(regions),
        });
      },
      error =>
        setPositionState({
          result: null,
          error,
          isLoading: false,
          regions: new Set(),
        }),
      {
        // 1 minute
        timeout: 1 * 60 * 1000,
        enableHighAccuracy: true,
        distanceFilter: 5,
      },
    );

    return () => {
      Geolocation.clearWatch(id);
    };
  }, []);

  const [geofencedRegions, setGeofencedRegions] = React.useState<Set<string>>(
    new Set(),
  );
  const [regionChangeTs, setRegionChangeTs] = React.useState(new Date());
  React.useEffect(() => {
    const init = async () => {
      try {
        //await NativeRegionMonitor.requestAuthorization();
        // TODO (kyle): only do this once per build?
        console.log('setting up region');
        await NativeRegionMonitor.clearRegions();
        await Promise.all(
          regions.map(region =>
            NativeRegionMonitor.addCircularRegion(
              region.coordinates,
              region.radius,
              region.id,
            ),
          ),
        );
      } catch (error) {
        console.warn(error);
      }
    };

    const off = NativeRegionMonitor.onRegionChange(
      ({didEnter, didExit, region}) => {
        console.log('got region', region);
        setGeofencedRegions(regions => {
          const nextRegions = new Set(regions);
          if (didEnter) {
            nextRegions.add(region.identifier);
          } else {
            nextRegions.delete(region.identifier);
          }
          return nextRegions;
        });
        setRegionChangeTs(new Date());
      },
    );

    init();

    return () => {
      off();
      NativeRegionMonitor.clearRegions();
    };
  }, []);

  const turfRegions = positionState.result
    ? getCurrentRegions(positionState.result.coords).map(
      region => region.id
    )
    : [];

    const playSound = () => {
      const sound = new Sound('./ms20.aif', Sound.MAIN_BUNDLE, error => {
        if (error) {
          console.warn(error);
        } else {
        sound.play();
        }
      });
    };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Button title="Play sound" onPress={playSound} />
          <TextSection title="Last render">
            {new Date().toLocaleTimeString()}
          </TextSection>
          <Section title="Location">
            {positionState.isLoading ? (
              <BodyText>Loading</BodyText>
            ) : positionState.result ? (
              <BodyText>
                {JSON.stringify(positionState.result, undefined, ' ')}
              </BodyText>
            ) : (
              <BodyText>error</BodyText>
            )}
          </Section>
          <TextSection title="Current objc regions">
            {[...positionState.regions].join(', ')}
          </TextSection>
          <TextSection title="Turf regions">
            {turfRegions.join(', ')}
          </TextSection>
          <TextSection title="Geofenced regions?">
            {[...geofencedRegions].join(', ')}
          </TextSection>
          <TextSection title="Last region change">
            {regionChangeTs.toLocaleTimeString()}
          </TextSection>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Section: React.FC<{
  title: string;
}> = ({children, title}) => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      {children}
    </View>
  );
};

function TextSection({title, children}: {title: string; children: string}) {
  return (
    <Section title={title}>
      <BodyText>{children}</BodyText>
    </Section>
  );
}

function BodyText({children}: {children: string}) {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <Text
      style={[
        styles.sectionDescription,
        {
          color: isDarkMode ? Colors.light : Colors.dark,
        },
      ]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;

function getPosition(
  options?: GeolocationOptions,
): Promise<GeolocationResponse> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(resolve, reject, options);
  });
}

function coordinatesToPoint({latitude, longitude}: LatLong) {
  return makePoint([latitude, longitude]);
}

function getCurrentRegions(coordinates: LatLong) {
  const point = coordinatesToPoint(coordinates);
  return regions.filter(
    region =>
      distance(coordinatesToPoint(region.coordinates), point, {
        units: 'meters',
      }) < region.radius,
  );
}

const regions = [
  {
    id: 'kyle-home',
    coordinates: {
      latitude: 37.7737191532,
      longitude: -122.4463025372918,
    },
    radius: 5,
  },
  {
    id: 'panhandle',
    coordinates: {
      latitude: 37.772465,
      longitude: -122.445739,
    },
    radius: 20,
  },
  {
    id: 'ritual',
    coordinates: {
      latitude: 37.770498,
      longitude: -122.443773,
    },
    radius: 10,
  },
];

const regionsMap = new Map(regions.map(region => [region.id, region]));
