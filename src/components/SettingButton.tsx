interface SettingButtonProps {
  onClick: () => void;
}

const SettingButton: React.FC<SettingButtonProps> = ({ onClick }) => {
  return <div className="timezone-icon__setting" onClick={onClick}></div>;
};

export default SettingButton;
