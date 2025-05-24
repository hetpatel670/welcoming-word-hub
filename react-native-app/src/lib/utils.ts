import tw from 'twrnc';

type ClassValue = string | undefined | null | false | ClassValue[];

// A basic 'cn' utility that mimics the web version's ability to filter falsy values
// and join class names. twrnc's `style` can often be used directly with arrays.
export function cn(...inputs: ClassValue[]): string {
  const classNames: string[] = [];

  function processInput(input: ClassValue) {
    if (typeof input === 'string') {
      classNames.push(input);
    } else if (Array.isArray(input)) {
      input.forEach(processInput);
    }
    // Falsy values (undefined, null, false) are ignored
  }

  inputs.forEach(processInput);
  return classNames.join(' ');
}

// Example of how twrnc's style can be used for conditional styling,
// which often replaces the need for a more complex cn + tailwind-merge.
// const conditionalStyle = tw.style('base-style', true && 'conditional-style', false && 'another-style');

// For direct use with twrnc, you can apply styles like:
// <View style={tw`p-4 ${isActive ? 'bg-blue-500' : 'bg-gray-500'}`} />
// Or using the `style` method for more complex conditionals:
// <View style={tw.style('p-4', isActive && 'bg-blue-500', !isActive && 'bg-gray-500')} />

export { tw }; // Re-export tw for convenience if desired elsewhere
