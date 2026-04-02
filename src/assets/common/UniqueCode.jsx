import toast from "react-hot-toast";

const UniqueCode = ({ text, className = "uniqueCodeColor", codeName }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast.success(`${codeName} copied to clipboard`);
  };

  return (
    <span className={className} onClick={handleCopy}>
      {text}
    </span>
  );
};

export default UniqueCode;
