/**
 * Type declarations for react-native-vector-icons/Ionicons
 */
declare module 'react-native-vector-icons/Ionicons' {
  import { Component } from 'react';
  import { TextProps, StyleProp, TextStyle } from 'react-native';

  export interface IoniconsProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
    style?: StyleProp<TextStyle>;
  }

  class Ionicons extends Component<IoniconsProps> {}
  export default Ionicons;
}

