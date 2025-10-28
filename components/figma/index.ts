export { default as FigmaImage } from './FigmaImage';
export { default as FigmaLogo } from './FigmaLogo';
export { default as FigmaText } from './FigmaText';
export { default as ImagePopup } from './ImagePopup';
export { default as TextPopup } from './TextPopup';
export type { FigmaImageProps } from './FigmaImage';
export type { FigmaLogoProps } from './FigmaLogo';
export type { FigmaTextProps } from './FigmaText';
export { useFigmaSelection } from '../hooks/useFigmaSelection';
export { useFigmaMultiSelection } from '../hooks/useFigmaMultiSelection';
export type { 
  FigmaSelectionState, 
  FigmaSelectionHandlers, 
  FigmaTransform,
  UseFigmaSelectionProps 
} from '../hooks/useFigmaSelection';
export type {
  FigmaMultiSelectionState,
  FigmaMultiSelectionHandlers,
  UseFigmaMultiSelectionProps
} from '../hooks/useFigmaMultiSelection';
