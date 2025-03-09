import React from 'react';
import { Link } from 'react-router-dom';

const SizeGuide: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 mb-16">
      <h1 className="text-3xl font-bold mt-28 mb-8 text-center">Size Guide</h1>
      
      <div className="max-w-4xl mx-auto bg-white p-8 shadow-md rounded-md">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Women's Clothing</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Size</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Bust (cm)</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Waist (cm)</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Hips (cm)</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">SA Size</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">XS</td>
                  <td className="border border-gray-300 px-4 py-2">76-81</td>
                  <td className="border border-gray-300 px-4 py-2">58-63</td>
                  <td className="border border-gray-300 px-4 py-2">84-89</td>
                  <td className="border border-gray-300 px-4 py-2">30-32</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-medium">S</td>
                  <td className="border border-gray-300 px-4 py-2">82-87</td>
                  <td className="border border-gray-300 px-4 py-2">64-69</td>
                  <td className="border border-gray-300 px-4 py-2">90-95</td>
                  <td className="border border-gray-300 px-4 py-2">32-34</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">M</td>
                  <td className="border border-gray-300 px-4 py-2">88-93</td>
                  <td className="border border-gray-300 px-4 py-2">70-75</td>
                  <td className="border border-gray-300 px-4 py-2">96-101</td>
                  <td className="border border-gray-300 px-4 py-2">34-36</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-medium">L</td>
                  <td className="border border-gray-300 px-4 py-2">94-99</td>
                  <td className="border border-gray-300 px-4 py-2">76-81</td>
                  <td className="border border-gray-300 px-4 py-2">102-107</td>
                  <td className="border border-gray-300 px-4 py-2">36-38</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">XL</td>
                  <td className="border border-gray-300 px-4 py-2">100-105</td>
                  <td className="border border-gray-300 px-4 py-2">82-87</td>
                  <td className="border border-gray-300 px-4 py-2">108-113</td>
                  <td className="border border-gray-300 px-4 py-2">38-40</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-medium">XXL</td>
                  <td className="border border-gray-300 px-4 py-2">106-111</td>
                  <td className="border border-gray-300 px-4 py-2">88-93</td>
                  <td className="border border-gray-300 px-4 py-2">114-119</td>
                  <td className="border border-gray-300 px-4 py-2">40-42</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Men's Clothing</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Size</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Chest (cm)</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Waist (cm)</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Hips (cm)</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">SA Size</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">XS</td>
                  <td className="border border-gray-300 px-4 py-2">86-91</td>
                  <td className="border border-gray-300 px-4 py-2">71-76</td>
                  <td className="border border-gray-300 px-4 py-2">86-91</td>
                  <td className="border border-gray-300 px-4 py-2">28-30</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-medium">S</td>
                  <td className="border border-gray-300 px-4 py-2">92-97</td>
                  <td className="border border-gray-300 px-4 py-2">77-82</td>
                  <td className="border border-gray-300 px-4 py-2">92-97</td>
                  <td className="border border-gray-300 px-4 py-2">30-32</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">M</td>
                  <td className="border border-gray-300 px-4 py-2">98-103</td>
                  <td className="border border-gray-300 px-4 py-2">83-88</td>
                  <td className="border border-gray-300 px-4 py-2">98-103</td>
                  <td className="border border-gray-300 px-4 py-2">32-34</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-medium">L</td>
                  <td className="border border-gray-300 px-4 py-2">104-109</td>
                  <td className="border border-gray-300 px-4 py-2">89-94</td>
                  <td className="border border-gray-300 px-4 py-2">104-109</td>
                  <td className="border border-gray-300 px-4 py-2">34-36</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">XL</td>
                  <td className="border border-gray-300 px-4 py-2">110-115</td>
                  <td className="border border-gray-300 px-4 py-2">95-100</td>
                  <td className="border border-gray-300 px-4 py-2">110-115</td>
                  <td className="border border-gray-300 px-4 py-2">36-38</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-medium">XXL</td>
                  <td className="border border-gray-300 px-4 py-2">116-121</td>
                  <td className="border border-gray-300 px-4 py-2">101-106</td>
                  <td className="border border-gray-300 px-4 py-2">116-121</td>
                  <td className="border border-gray-300 px-4 py-2">38-40</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How to Measure</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Bust/Chest</h3>
              <p className="text-sm text-gray-700">Measure around the fullest part of your bust/chest, keeping the measuring tape horizontal.</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Waist</h3>
              <p className="text-sm text-gray-700">Measure around your natural waistline, keeping the tape comfortably loose.</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Hips</h3>
              <p className="text-sm text-gray-700">Measure around the fullest part of your hips, about 20cm below your waistline.</p>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Shoe Size Conversion</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">EU</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">UK</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">US (Women)</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">US (Men)</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Foot Length (cm)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">35</td>
                  <td className="border border-gray-300 px-4 py-2">2.5</td>
                  <td className="border border-gray-300 px-4 py-2">5</td>
                  <td className="border border-gray-300 px-4 py-2">3.5</td>
                  <td className="border border-gray-300 px-4 py-2">22.1</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">36</td>
                  <td className="border border-gray-300 px-4 py-2">3.5</td>
                  <td className="border border-gray-300 px-4 py-2">6</td>
                  <td className="border border-gray-300 px-4 py-2">4.5</td>
                  <td className="border border-gray-300 px-4 py-2">22.8</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">37</td>
                  <td className="border border-gray-300 px-4 py-2">4</td>
                  <td className="border border-gray-300 px-4 py-2">6.5</td>
                  <td className="border border-gray-300 px-4 py-2">5</td>
                  <td className="border border-gray-300 px-4 py-2">23.5</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">38</td>
                  <td className="border border-gray-300 px-4 py-2">5</td>
                  <td className="border border-gray-300 px-4 py-2">7.5</td>
                  <td className="border border-gray-300 px-4 py-2">6</td>
                  <td className="border border-gray-300 px-4 py-2">24.1</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">39</td>
                  <td className="border border-gray-300 px-4 py-2">6</td>
                  <td className="border border-gray-300 px-4 py-2">8.5</td>
                  <td className="border border-gray-300 px-4 py-2">7</td>
                  <td className="border border-gray-300 px-4 py-2">24.8</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">40</td>
                  <td className="border border-gray-300 px-4 py-2">6.5</td>
                  <td className="border border-gray-300 px-4 py-2">9</td>
                  <td className="border border-gray-300 px-4 py-2">7.5</td>
                  <td className="border border-gray-300 px-4 py-2">25.4</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">41</td>
                  <td className="border border-gray-300 px-4 py-2">7.5</td>
                  <td className="border border-gray-300 px-4 py-2">10</td>
                  <td className="border border-gray-300 px-4 py-2">8.5</td>
                  <td className="border border-gray-300 px-4 py-2">26.0</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">42</td>
                  <td className="border border-gray-300 px-4 py-2">8</td>
                  <td className="border border-gray-300 px-4 py-2">10.5</td>
                  <td className="border border-gray-300 px-4 py-2">9</td>
                  <td className="border border-gray-300 px-4 py-2">26.7</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
      
      <div className="mt-8 text-center text-gray-600">
        <p>If you have any questions about sizing, please don't hesitate to <Link to="/contact" className="text-black underline">contact us</Link>.</p>
      </div>
    </div>
  );
};

export default SizeGuide;
