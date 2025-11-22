import { useState } from 'react';

export default function ManualDataEntry({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    zipcode: '',
    price: '',
    priceHistory: '',
    description: '',
    imageUrl: '',
    daysOnMarket: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Parse price history (format: "2500,2300,2100" means 3 price drops)
    const priceHistoryArray = formData.priceHistory
      .split(',')
      .map(p => p.trim())
      .filter(p => p)
      .map((price, idx) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (formData.priceHistory.split(',').length - idx - 1));
        return {
          date: date.toISOString(),
          price: parseInt(price) || 0
        };
      });

    const listingData = {
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipcode: formData.zipcode,
      price: parseInt(formData.price) || 0,
      priceHistory: priceHistoryArray,
      description: formData.description,
      images: formData.imageUrl ? [formData.imageUrl] : [],
      daysOnMarket: parseInt(formData.daysOnMarket) || 0
    };

    onSubmit(listingData);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-lg border-2 border-blue-200 p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Enter Listing Data</h2>
        <p className="text-sm text-gray-600">
          For demo purposes, manually enter data from a Zillow listing.
          In production, this would be automatically scraped.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Street Address *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="123 Main St"
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              placeholder="Brooklyn"
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              State *
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              placeholder="NY"
              maxLength="2"
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              ZIP Code *
            </label>
            <input
              type="text"
              name="zipcode"
              value={formData.zipcode}
              onChange={handleChange}
              required
              placeholder="11201"
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Current Price *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              placeholder="2200"
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Days on Market
            </label>
            <input
              type="number"
              name="daysOnMarket"
              value={formData.daysOnMarket}
              onChange={handleChange}
              placeholder="85"
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Price History (comma-separated, oldest to newest)
          </label>
          <input
            type="text"
            name="priceHistory"
            value={formData.priceHistory}
            onChange={handleChange}
            placeholder="2800, 2500, 2200"
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Example: "2800, 2500, 2200" = started at $2800, dropped to $2500, then $2200
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            placeholder="Cozy studio apartment in up-and-coming neighborhood..."
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Exterior Image URL (optional)
          </label>
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://photos.zillowstatic.com/..."
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Right-click on the listing's exterior photo and copy image URL
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Analyze This Listing
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
