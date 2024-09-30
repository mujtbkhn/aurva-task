import React, { useEffect, useState } from "react";

interface MealDetails {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags: string;
  strYoutube: string;
}

interface DetailsProps {
  id: string;
}

const Details: React.FC<DetailsProps> = ({ id }) => {
  const [data, setData] = useState<MealDetails | null>(null);

  useEffect(() => {
    fetchMealDetails(id);
  }, [id]);

  const fetchMealDetails = async (id: string) => {
    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
      );
      const json = await response.json();
      setData(json.meals[0]);
    } catch (error) {
      console.error("Error fetching meal details:", error);
    }
  };

  if (!data) {
    return <div className="text-center py-4">Loading...</div>;
  }

  const tags = data.strTags ? data.strTags.split(',') : [];

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-2xl mx-auto my-8">
      <img src={data.strMealThumb} alt={data.strMeal} className="w-full h-64 object-cover" />
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">{data.strMeal}</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-lg font-semibold mb-1 text-gray-700">Category: <span className="font-normal">{data.strCategory}</span></h3>
        <h3 className="text-lg font-semibold mb-1 text-gray-700">Area: <span className="font-normal">{data.strArea}</span></h3>
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          YouTube: 
          <a href={data.strYoutube} target="_blank" rel="noopener noreferrer" className="font-normal text-blue-600 hover:underline ml-1">
            Watch Video
          </a>
        </h3>
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Instructions:</h3>
        <p className="text-gray-600 whitespace-pre-line">{data.strInstructions}</p>
      </div>
    </div>
  );
};

export default Details;