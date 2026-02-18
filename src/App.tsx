import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Items from './pages/Items';
import ItemForm from './pages/ItemForm';
import Locations from './pages/Locations';
import FloorPlan from './pages/FloorPlan';

function App() {
  return (
    <BrowserRouter basename="/home-storage">
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/items" element={<Items />} />
          <Route path="/items/new" element={<ItemForm />} />
          <Route path="/items/:id" element={<ItemForm />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/floorplan" element={<FloorPlan />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
