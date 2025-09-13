import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faHome, faInr, faStar, faTrash, faPlus, faCheck, faTimes, faLock, faSearch, faMaximize, faDownload } from "@fortawesome/free-solid-svg-icons";

const iconMap = {
  map_marker: faMapMarkerAlt,
  rupee:faInr,
  home: faHome, 
  star:faStar,
  trash:faTrash,
  plus:faPlus,
  tick:faCheck,
  cross:faTimes,
  lock:faLock,
  search:faSearch,
  max:faMaximize,
  download:faDownload,
  location: faMapMarkerAlt,
  wedding: faHome,
  // Maximize: Maximize
  
};

import { SizeProp } from "@fortawesome/fontawesome-svg-core";
import { Maximize } from "lucide-react";

const DynamicIcon: React.FC<{ name: string; size: SizeProp,color:string }> = ({ name, size, color }) => {
  return <FontAwesomeIcon icon={iconMap[name]} color={color} size={size} />;
};

export default DynamicIcon;
