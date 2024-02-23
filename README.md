# Madcamp Team Matching Algorithm

Try https://teammatching.madcamp.io/

- Developed in React Native Expo Web (Expo SDK 50, Expo Router V3)
- Deployed on Netlify

### utils/algorithm.ts

- main logic for team matching
- **make_graph** constructs graph given array of students - helper function
- **mcmf** runs Minimum Cost Maximum Flow on given graph - helper function
- **match** returns complete matching result given array of students
- TODO: more explanation
