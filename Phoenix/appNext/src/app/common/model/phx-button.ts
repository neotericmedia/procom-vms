// Model for buttonOptions
export interface PhxButton {
  icon: string; // material icon name
  tooltip: string; // Hover help
  btnType: string; // primary/default/general appended to button class ex. btn-{btnType} === btn-primary
  btnClasses?: string[]; // addtional button classes
  disabled?(): boolean;
  action(); // Pass the function name to execute on click
}
