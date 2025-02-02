interface DeleteButtonProps {
  onClick: () => void;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ onClick }) => {
  return <button className="timezone-btn__delete" onClick={onClick}></button>;
};

export default DeleteButton;
