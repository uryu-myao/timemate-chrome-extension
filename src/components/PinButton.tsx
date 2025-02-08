interface PinButtonProps {
  isPinned: boolean;
  onClick: () => void;
}

const PinButton: React.FC<PinButtonProps> = ({ isPinned, onClick }) => {
  return (
    <button
      className={`timezone-btn__pin ${isPinned ? 'pinned' : ''}`}
      onClick={onClick}
    />
  );
};

export default PinButton;
