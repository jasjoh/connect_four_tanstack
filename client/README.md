Goal: Refactoring the OOP version of our connect four game to use React

Initial Approach:
- translate view state (e.g the html board state) into React components
- maintain game state (the JS board state) inside JS objects (e.g. game instance)
- treat the interaction between the view and the js objects (models) as though it were an API
- react / view shouldn't know what's happening in the game state and vice versa
- achieve code coverage to identify breaking changes in future refactors

Key Learnings:
- In React, mutating an object maintained in state (e.g. an instance of our game) does not trigger a re-render. You either need to create a new instance (replacing the existing instance) or create a re-render toggle. The latter is what we implemented.
- When testing React via Jest, you mock child components via `jest.mock(Component)` and then you can confirm correct params are being passed down by leveraging `toHaveBeenCalledith()`. An important point being that two objects are passed to each component: an object containing each param (as a k:v pair) and a second object which is empty. You can handle this by using expect.anything() as the value for that second object.
- You can access (and call) any callback functions passed down to a mocked child component via the code: `component.mock.calls[0][0] to access the params and then call the associated param value
- **IMPORTANT**: When dealing with data models and components, in order to avoid potential of naming clashes when testing, consider name components with the suffix 'Component'.
- When attempting to test whether the method of an instance has been called, you can use `spyOn()`, but only on the instance (e.g. accessed via `mock.instances`)- you cannot spy on the method within the class itself.
