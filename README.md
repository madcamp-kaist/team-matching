# Madcamp Team Matching Algorithm

Try https://teammatching.madcamp.io/

- Developed in React Native Expo Web (Expo SDK 50, Expo Router V3)
- Deployed on Netlify

### utils/algorithm.ts

- main logic for team matching
- **make_graph** constructs graph given array of students - helper function
- **mcmf** runs Minimum Cost Maximum Flow on given graph - helper function
- **match** returns complete matching result given array of students

## Algorithm Description

- 이 알고리즘은 사람을 majority와 minority 두 가지로 구분하며, 다양성을 위해 majority와 minority가 최대한 많이 매칭될 수 있도록 하는 것이 목표이다. 몰입캠프의 경우 majority는 타대생, minority는 KAIST생이다.
- 즉, 이 알고리즘의 목표는 n명의 사람이 주어질 때, 아래의 조건을 만족하는 1주차 팀 n/2개, 2주차 팀 n/2개를 생성하는 것이다.

  - 모든 팀은 2인으로 구성된다.
  - 1주차에 같은 팀을 했던 사람과는 2주차에 같은 팀을 할 수 없다.
  - 모든 majority는 2주 동안 적어도 한 번은 minority와 팀을 해야 한다.
  - 위의 모든 조건을 만족하는 매칭이 여러 개인 경우, 2주 동안 한 번도 이성과 팀을 할 수 없는 사람의 수를 최소화한다.

- 시간복잡도 : O(n^4)

### Example

- 1부터 8까지 번호가 붙은 8명의 사람이 주어진다.
- 1, 2, 3, 4, 5가 majority에 해당하고, 6, 7, 8이 minority에 해당한다고 하자.
- 이 때, 다음과 같은 Bipartite 그래프를 만들고 source에서 sink를 추가하여 최대 유량을 흘린다고 가정하자.
![image](https://github.com/madcamp-kaist/team-matching/assets/81062893/6deee6b6-a5ec-421f-88e7-9a7f2431d398)
- 각 간선의 용량은 다음과 같이 설정한다.
![image](https://github.com/madcamp-kaist/team-matching/assets/81062893/4f7c1ee6-2219-48a9-92b2-2b1fd25d6c2d)
  - majority 노드에는 2의 유량이 들어올 수 있으며, minority 노드로 이어지는 간선의 용량은 1이므로 최대 유량이 흐르는 경우 majority 노드 하나는 서로 다른 minority 노드 둘과 연결된다. 이는 각각 1주차 팀원, 2주차 팀원이 된다.
  - 마찬가지로, minority 노드에서 sink 노드로는 2의 유량이 흐를 수 있으며, 이에 따라 최대 유량이 흐르는 경우 minority 노드는 서로 다른 majority 노드 둘에서 흐르는 유량을 받아야 함을 알 수 있다. 이는 역시 각각 1주차, 2주차 팀원이 된다.
  - 어쩔 수 없이 매칭에 실패하는 majority 노드의 유량은 dummy 노드로 연결된다. dummy 노드와 연결되는 경우, 1주차나 2주차 둘 중 한번은 minority와 팀을 할 수 없음을 의미한다.
  - dummy 노드에서 sink 노드로 가는 간선의 용량은 무한으로, 몇 명의 majority가 dummy와 연결되어도 상관없음을 의미한다.
  - dummy 노드로 이어지는 간선의 용량은 1로, 1주차와 2주차 중 적어도 한 번은 minority 노드와 연결됨이 보장된다.

- 각 간선의 가중치는 다음과 같이 설정한다.
  
  ![image](https://github.com/madcamp-kaist/team-matching/assets/81062893/10cc008b-1664-4f73-8955-479755ed3eeb)
  - dummy 노드에서 sink 노드로 가는 간선에만 큰 가중치를 둔다.
  - 따라서, 가중치를 최소화한다면 자연스레 dummy 노드와 연결되는 majority 노드의 수가 최소화된다.

- 위 그래프에서 **MCMF**를 돌리고, 유량이 흐르는 간선을 조사하면 어떤 majority 노드와 minority 노드가 연결되었는지 확인할 수 있다.
- 유량이 흐르는 간선, 즉 매칭 결과만 남긴 그래프를 생각해보자.
  ![image](https://github.com/madcamp-kaist/team-matching/assets/81062893/eebc5ece-8e98-43eb-88e6-7ae0969548a7)
  - majority 노드와 minority 노드는 그래프 특성 및 MCMF 특성 상 degree가 무조건 2이다.
  - dummy 노드의 degree는 그래프 특성 상 2*(majority 수 - minority 수)이므로, 2의 배수이다.
- 이는 위 그래프에서 **Euler Tour**가 가능함을 의미하며, 경로에 속한 간선의 개수 역시 2의 배수가 된다.
- 따라서, 아래와 같이 임의의 방향으로 Euler Tour를 하며 빨간색과 파란색을 번갈아가며 색칠해보도록 하자.
  ![image](https://github.com/madcamp-kaist/team-matching/assets/81062893/71f65c10-e088-41aa-9e92-4bf52481d00e)
  - 이 때, 빨간색 간선은 1주차 팀, 파란색 간선은 2주차 팀으로 생각하면 모든 조건을 만족하며 매칭을 성공할 수 있다.
  - 위 예시와 다르게 모든 노드가 하나의 Connected Component에 포함되지 않을 수 있다. 이 때는 존재하는 모든 Connected Component에 같은 작업을 진행하면 된다.
  - dummy 노드에 연결된 majority 노드는 해당 주차에 minority와 팀을 할 수 없음을 의미한다. 따라서, dummy 노드에 연결된 노드들을 따로 모아 자기들끼리 임의로 매칭해주면 된다.
- 따라서, 위 경우에 1주차 팀은 1-7, 2-6, 3-4, 5-8, 2주차 팀은 1-6, 2-5, 3-8, 4-7이 된다.

  
