// src/pages/Platforms.jsx
import { useEffect, useState } from "react";

export const Platforms = () => {
  const [platforms, setPlatforms] = useState([]);

  useEffect(() => {
    fetch('https://solid-giggle-4jvxvjxj7gqpc7qgg-3001.app.github.dev/api/platforms')
      .then((res) => res.json())
      .then((data) => setPlatforms(data))
  }, []);

  return (
    <div className="p-4">
      <table className="table-auto border-collapse w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Price</th>
          </tr>
        </thead>
        <tbody>
          {platforms.map((platform) => (
            <tr key={platform.id}>
              <td className="border px-4 py-2">{platform.name}</td>
              <td className="border px-4 py-2">{platform.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
