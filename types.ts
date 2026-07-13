export interface Brand {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Driver {
  id: number;
  name: string;
  version: string;
  brand_id: number;
  brand_name?: string;
  download_link: string;
  silent_install_switch: string;
}

export interface Tool {
  id: number;
  name: string;
  version: string;
  brand_id: number;
  brand_name?: string;
  category_id: number;
  category_name?: string;
  download_link: string;
  file_size: string;
  icon_image: string;
  short_description: string;
  long_description: string;
  required_driver_id: number;
  required_driver_name?: string;
}
