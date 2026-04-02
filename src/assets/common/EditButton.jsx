import { MdEdit } from "react-icons/md";

const EditButton = ({ onClick, className = "", isDisabled = false,additionalText="" }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-2 ${
      isDisabled ? "text-gray-400 cursor-not-allowed" : "text-yellow-400"
    } ${className}`}
    disabled={isDisabled}
  >
    <span>
      <MdEdit size={15} />
    </span>
    Edit {additionalText}
  </button>
);

export default EditButton;
