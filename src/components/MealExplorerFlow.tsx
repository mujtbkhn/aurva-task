import React, { useCallback, useState, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  BackgroundVariant,
  EdgeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Details from "./Details";

interface Category {
  strCategory: string;
}

interface Meal {
  strMeal: string;
  idMeal: string;
}

interface CategoryResponse {
  categories: Category[];
}

interface MealResponse {
  meals: Meal[];
}

interface MealDetails {
  strIngredient1: string;
  strIngredient2: string;
  strIngredient3: string;
  strIngredient4: string;
  strIngredient5: string;
  strTags: string;
  strInstructions: string;
}

interface MealDetailsResponse {
  meals: MealDetails[];
}

interface MealByIngredientResponse {
  meals: Meal[] | null;
}

const initialNodes: Node[] = [
  {
    id: "explorer",
    position: { x: 250, y: 0 },
    data: {
      label: (
        <div className="flex items-center space-x-2 bg-blue-100 p-3 rounded-lg shadow-md">
          <img
            width="24"
            height="24"
            src="https://img.icons8.com/ios-filled/50/000000/compass.png"
            alt="compass"
          />
          <span className="font-semibold text-blue-800">Explorer</span>
        </div>
      ),
    },
    className: "border-2 border-blue-300 rounded-xl",
  },
];

const initialEdges: Edge[] = [];

const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
}) => {
  const edgePath = `M ${sourceX},${sourceY} C ${
    (sourceX + targetX) / 2
  },${sourceY} ${(sourceX + targetX) / 2},${targetY} ${targetX},${targetY}`;

  return (
    <g>
      <path
        id={id}
        className="stroke-purple-400 stroke-2"
        d={edgePath}
        strokeDasharray="5,5"
        fill="none"
      />
      <circle cx={targetX} cy={targetY} r="3" fill="#9F7AEA" />
    </g>
  );
};

const edgeTypes = {
  custom: CustomEdge,
};

export default function MealExplorerFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [categories, setCategories] = useState<string[]>([]);
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://www.themealdb.com/api/json/v1/1/categories.php")
      .then((response) => response.json())
      .then((data: CategoryResponse) => {
        const fetchedCategories = data.categories
          .slice(0, 5)
          .map((cat) => cat.strCategory);
        setCategories(fetchedCategories);
      });
  }, []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const fetchMeals = useCallback((category: string) => {
    return fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
    )
      .then((response) => response.json())
      .then((data: MealResponse) =>
        data.meals
          .slice(0, 5)
          .map((meal) => ({ name: meal.strMeal, id: meal.idMeal }))
      );
  }, []);

  const fetchMealDetails = useCallback(
    (mealId: string): Promise<MealDetails> => {
      return fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
      )
        .then((response) => response.json())
        .then((data: MealDetailsResponse) => data.meals[0]);
    },
    []
  );

  const fetchMealsByIngredient = useCallback((ingredient: string) => {
    return fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`
    )
      .then((response) => response.json())
      .then(
        (data: MealByIngredientResponse) =>
          data.meals
            ?.slice(0, 5)
            .map((meal) => ({ name: meal.strMeal, id: meal.idMeal })) || []
      );
  }, []);

  const onNodeClick = useCallback(
    async (node: Node) => {
      if (node.id === "explorer" && categories.length > 0) {
        const newNodes: Node[] = categories.map((category, index) => ({
          id: `category-${index}`,
          position: { x: 100 + index * 150, y: 100 },
          data: {
            label: (
              <div className="flex items-center space-x-2 bg-green-100 p-2 rounded-md shadow-sm">
                <img
                  width="24"
                  height="24"
                  src="https://img.icons8.com/ios-filled/50/006400/organic-food.png"
                  alt="organic-food"
                />
                <span className="font-medium text-green-800">{category}</span>
              </div>
            ),
          },
          className: "border-2 border-green-300 rounded-xl",
        }));

        const newEdges: Edge[] = categories.map((_, index) => ({
          id: `edge-explorer-${index}`,
          source: "explorer",
          target: `category-${index}`,
          type: "custom",
        }));

        setNodes((nds) => [
          ...nds,
          ...newNodes.filter(
            (newNode) => !nds.some((n) => n.id === newNode.id)
          ),
        ]);
        setEdges((eds) => [
          ...eds,
          ...newEdges.filter(
            (newEdge) => !eds.some((e) => e.id === newEdge.id)
          ),
        ]);
      } else if (node.id.startsWith("category-")) {
        const categoryIndex = parseInt(node.id.split("-")[1]);
        const viewMealsNodeId = `view-meals-${categoryIndex}`;

        if (!nodes.some((n) => n.id === viewMealsNodeId)) {
          const viewMealsNode: Node = {
            id: viewMealsNodeId,
            position: { x: node.position.x, y: node.position.y + 100 },
            data: {
              label: (
                <div className="flex items-center justify-center space-x-2 bg-yellow-100 p-2 rounded-md shadow-sm">
                  <img
                    width="24"
                    height="24"
                    src="https://img.icons8.com/ios-filled/50/FFA500/restaurant-menu.png"
                    alt="menu"
                  />
                  <div className="font-medium text-yellow-800">View Meals</div>
                </div>
              ),
            },
            className: "border-2 border-yellow-300 rounded-xl",
          };

          const newEdge: Edge = {
            id: `edge-category-${categoryIndex}-view-meals`,
            source: node.id,
            target: viewMealsNodeId,
            type: "custom",
          };

          setNodes((nds) => [...nds, viewMealsNode]);
          setEdges((eds) => [...eds, newEdge]);
        }
      } else if (node.id.startsWith("view-meals-")) {
        const categoryIndex = parseInt(node.id.split("-")[2]);
        const category = categories[categoryIndex];
        const meals = await fetchMeals(category);

        const mealNodes: Node[] = meals.map((meal, index) => ({
          id: `meal-${categoryIndex}-${index}`,
          position: {
            x: node.position.x - 200 + index * 200,
            y: node.position.y + 100,
          },
          data: {
            label: (
              <div className="flex items-center justify-center space-x-2 bg-red-100 p-2 rounded-md shadow-sm">
                <img
                  width="24"
                  height="24"
                  src="https://img.icons8.com/ios-filled/50/FF0000/meal.png"
                  alt="meal"
                />
                <span className="font-medium text-red-800">{meal.name}</span>
              </div>
            ),
            mealId: meal.id,
          },
          className: "border-2 border-red-300 rounded-xl",
        }));

        const mealEdges: Edge[] = meals.map((_, index) => ({
          id: `edge-view-meals-${categoryIndex}-meal-${index}`,
          source: node.id,
          target: `meal-${categoryIndex}-${index}`,
          type: "custom",
        }));

        setNodes((nds) => [
          ...nds,
          ...mealNodes.filter(
            (newNode) => !nds.some((n) => n.id === newNode.id)
          ),
        ]);
        setEdges((eds) => [
          ...eds,
          ...mealEdges.filter(
            (newEdge) => !eds.some((e) => e.id === newEdge.id)
          ),
        ]);
      } else if (node.id.startsWith("meal-")) {
        const mealId = node.data.mealId as string;
        if (mealId) {
          const optionNodes: Node[] = [
            {
              id: `view-ingredients-${node.id}`,
              position: { x: node.position.x - 100, y: node.position.y + 200 },
              data: {
                label: (
                  <div className="flex items-center justify-center space-x-2 bg-indigo-100 p-2 rounded-md shadow-sm">
                    <img
                      width="24"
                      height="24"
                      src="https://img.icons8.com/ios-filled/50/4F46E5/ingredients.png"
                      alt="ingredients"
                    />
                    <span className="font-medium text-indigo-800">
                      View Ingredients
                    </span>
                  </div>
                ),
                mealId,
              },
              className: "border-2 border-indigo-300 rounded-xl",
            },
            {
              id: `view-tags-${node.id}`,
              position: { x: node.position.x + 100, y: node.position.y + 200 },
              data: {
                label: (
                  <div className="flex items-center justify-center space-x-2 bg-indigo-100 p-2 rounded-md shadow-sm">
                    <img
                      width="24"
                      height="24"
                      src="https://img.icons8.com/color/48/tags--v1.png"
                      alt="tags--v1"
                    />
                    <span className="font-medium text-indigo-800">
                      View Tags
                    </span>
                  </div>
                ),
                mealId,
              },
              className: "border-2 border-indigo-300 rounded-xl",
            },
            {
              id: `view-details-${node.id}`,
              position: { x: node.position.x + 300, y: node.position.y + 200 },
              data: {
                label: (
                  <div className="flex items-center justify-center space-x-2 bg-indigo-100 p-2 rounded-md shadow-sm">
                    <img
                      width="24"
                      height="24"
                      src="https://img.icons8.com/plasticine/100/view-details.png"
                      alt="view-details"
                    />
                    <span className="font-medium text-indigo-800">
                      View Details
                    </span>
                  </div>
                ),
                mealId,
              },
              className: "border-2 border-indigo-300 rounded-xl",
            },
          ];

          const optionEdges: Edge[] = optionNodes.map((optionNode) => ({
            id: `edge-${node.id}-${optionNode.id}`,
            source: node.id,
            target: optionNode.id,
            type: "custom",
          }));

          setNodes((nds) => [...nds, ...optionNodes]);
          setEdges((eds) => [...eds, ...optionEdges]);
        }
      } else if (node.id.startsWith("view-ingredients-")) {
        const mealId: string = node.data.mealId as string;
        const mealDetails = await fetchMealDetails(mealId);

        const ingredients = [
          mealDetails.strIngredient1,
          mealDetails.strIngredient2,
          mealDetails.strIngredient3,
          mealDetails.strIngredient4,
          mealDetails.strIngredient5,
        ].filter((ingredient) => ingredient && ingredient.trim() !== "");

        const ingredientNodes: Node[] = ingredients.map(
          (ingredient, index) => ({
            id: `ingredient-${node.id}-${index}`,
            position: {
              x: node.position.x - 200 + index * 250,
              y: node.position.y + 150,
            },
            data: {
              label: (
                <div className="flex items-center justify-center space-x-2 bg-pink-100 p-2 rounded-md shadow-sm">
                  <img
                    width="24"
                    height="24"
                    src="https://img.icons8.com/color/48/carrot.png"
                    alt="carrot"
                  />
                  <span className="font-medium text-pink-800">
                    {ingredient}
                  </span>
                </div>
              ),
            },
            className: "border-2 border-pink-300 rounded-xl",
          })
        );

        const ingredientEdges: Edge[] = ingredients.map((_, index) => ({
          id: `edge-${node.id}-ingredient-${index}`,
          source: node.id,
          target: `ingredient-${node.id}-${index}`,
          type: "custom",
        }));

        setNodes((nds) => [...nds, ...ingredientNodes]);
        setEdges((eds) => [...eds, ...ingredientEdges]);
      } else if (node.id.startsWith("view-tags-")) {
        const mealId: string = node.data.mealId as string;
        const mealDetails = await fetchMealDetails(mealId);

        const tags = mealDetails.strTags
          ? mealDetails.strTags.split(",")
          : ["No tags"];

        const tagNodes: Node[] = tags.map((tag, index) => ({
          id: `tag-${node.id}-${index}`,
          position: {
            x: node.position.x + index * 300,
            y: node.position.y + 150,
          },
          data: {
            label: (
              <div className="flex items-center justify-center space-x-2 bg-pink-100 p-2 rounded-md shadow-sm">
                <span className="font-medium text-pink-800">{tag.trim()}</span>
              </div>
            ),
          },
          className: "border-2 border-pink-300 rounded-xl",
        }));

        const tagEdges: Edge[] = tags.map((_, index) => ({
          id: `edge-${node.id}-tag-${index}`,
          source: node.id,
          target: `tag-${node.id}-${index}`,
          type: "custom",
        }));

        setNodes((nds) => [...nds, ...tagNodes]);
        setEdges((eds) => [...eds, ...tagEdges]);
      } else if (node.id.startsWith("view-details-")) {
        const mealId: string = node.data.mealId as string;
        setSelectedMealId(mealId);
      } else if (node.id.startsWith("ingredient-")) {
        const label = node.data.label as JSX.Element;
        const ingredient = label.props.children[1].props.children;
        const meals = await fetchMealsByIngredient(ingredient);

        const mealNodes: Node[] = meals.map((meal, index) => ({
          id: `meal-by-ingredient-${node.id}-${index}`,
          position: {
            x: node.position.x - 200 + index * 200,
            y: node.position.y + 200,
          },
          data: {
            label: (
              <div className="flex items-center justify-center space-x-2 bg-orange-100 p-2 rounded-md shadow-sm">
                <img
                  width="24"
                  height="24"
                  src="https://img.icons8.com/ios-filled/50/FF8C00/meal.png"
                  alt="meal"
                />
                <span className="font-medium text-orange-800">{meal.name}</span>
              </div>
            ),
            mealId: meal.id,
          },
          className: "border-2 border-orange-300 rounded-xl",
        }));

        const mealEdges: Edge[] = meals.map((_, index) => ({
          id: `edge-ingredient-${node.id}-meal-${index}`,
          source: node.id,
          target: `meal-by-ingredient-${node.id}-${index}`,
          type: "custom",
        }));

        setNodes((nds) => [
          ...nds,
          ...mealNodes.filter(
            (newNode) => !nds.some((n) => n.id === newNode.id)
          ),
        ]);
        setEdges((eds) => [
          ...eds,
          ...mealEdges.filter(
            (newEdge) => !eds.some((e) => e.id === newEdge.id)
          ),
        ]);
      }
    },
    [
      categories,
      setNodes,
      setEdges,
      fetchMeals,
      fetchMealDetails,
      fetchMealsByIngredient,
    ]
  );

  return (
    <div className="w-screen h-screen bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: "custom" }}
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
      {selectedMealId && (
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white shadow-lg overflow-y-auto">
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            onClick={() => setSelectedMealId(null)}
          >
            Close
          </button>
          <Details id={selectedMealId} />
        </div>
      )}
    </div>
  );
}
