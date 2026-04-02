import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'flowbite-react';
import DuplicateOutlet from '../../components/Outlet/DuplicateOutlet';

const DuplicateOutletReport = () => {
  const [duplicateGroups, setDuplicateGroups] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Get data from localStorage
    const storedData = localStorage.getItem('duplicateOutletData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setDuplicateGroups(parsedData);
        // Clean up localStorage after loading
        localStorage.removeItem('duplicateOutletData');
      } catch (error) {
        console.error('Error parsing duplicate outlet data:', error);
        navigate(-1); // Go back if data is invalid
      }
    } else {
      // No data found, go back
      navigate(-1);
    }
  }, [navigate]);

  const handleClose = () => {
    window.close(); // Close the tab
  };

  if (duplicateGroups.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading duplicate outlet report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex justify-between items-center p-4 bg-white border-b">
        <h1 className="text-2xl font-bold text-gray-800">Duplicate Outlet Data Report</h1>
        <Button
          onClick={handleClose}
          color="gray"
          className="hover:bg-gray-100"
        >
          Close Tab
        </Button>
      </div>
      <DuplicateOutlet duplicateGroups={duplicateGroups} />
    </div>
  );
};

export default DuplicateOutletReport;
