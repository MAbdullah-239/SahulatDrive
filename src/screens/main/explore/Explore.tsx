import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  Modal,
  SafeAreaView,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import {Colors} from '../../../generalStyles/colors';
import {FontFamily} from '../../../generalStyles/generalFonts';
import {
  Search,
  X,
  MapPin,
  Star,
  Clock,
  Navigation,
  Zap,
  Wrench,
  Fuel,
  Truck,
  Droplets,
  Battery,
  SlidersHorizontal,
  ChevronRight,
  Phone,
  MessageCircle,
  CheckCircle,
  XCircle,
  MapPinned,
  Award,
} from 'lucide-react-native';
import {
  FONT_SIZE,
  HEIGHT_BASE_RATIO,
  WIDTH_BASE_RATIO,
} from '../../../utils/helpers';

const {width} = Dimensions.get('window');

interface Workshop {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  distance: string;
  open: boolean;
  address: string;
  phone: string;
  services: string[];
  hours: string;
  coordinate: {latitude: number; longitude: number};
}
interface Mechanic {
  id: string;
  name: string;
  rating: number;
  jobs: number;
  specialization: string;
  status: string;
  experience: string;
  phone: string;
  skills: string[];
  coordinate: {latitude: number; longitude: number};
}

const categories = [
  {id: 'battery', name: 'Battery', Icon: Battery, color: '#F59E0B'},
  {id: 'tyre', name: 'Tyre', Icon: Navigation, color: '#6366F1'},
  {id: 'engine', name: 'Engine', Icon: Zap, color: '#E8490F'},
  {id: 'tow', name: 'Tow Truck', Icon: Truck, color: '#3B82F6'},
  {id: 'fuel', name: 'Fuel', Icon: Fuel, color: '#10B981'},
  {id: 'wash', name: 'Car Wash', Icon: Droplets, color: '#06B6D4'},
];

const mockWorkshops: Workshop[] = [
  {
    id: 'w1',
    name: 'Auto Experts Workshop',
    rating: 4.8,
    reviews: 124,
    distance: '1.2 km',
    open: true,
    address: 'Liberty Market, Lahore',
    phone: '+92 300 1111111',
    services: ['Engine', 'Tyres', 'AC', 'Brakes'],
    hours: 'Open · Closes 9 PM',
    coordinate: {latitude: 31.5244, longitude: 74.3547},
  },
  {
    id: 'w2',
    name: 'QuickFix Car Service',
    rating: 4.6,
    reviews: 89,
    distance: '2.5 km',
    open: true,
    address: 'Gulberg II, Lahore',
    phone: '+92 300 2222222',
    services: ['Oil Change', 'Brakes', 'Battery'],
    hours: 'Open · Closes 8 PM',
    coordinate: {latitude: 31.5124, longitude: 74.3647},
  },
  {
    id: 'w3',
    name: 'Lahore Tuning Center',
    rating: 4.2,
    reviews: 45,
    distance: '3.8 km',
    open: false,
    address: 'Model Town, Lahore',
    phone: '+92 300 3333333',
    services: ['Tuning', 'Exhaust', 'Suspension'],
    hours: 'Closed · Opens 9 AM',
    coordinate: {latitude: 31.5304, longitude: 74.3487},
  },
];

const mockMechanics: Mechanic[] = [
  {
    id: 'm1',
    name: 'Zahid Khan',
    rating: 4.9,
    jobs: 312,
    specialization: 'Engine & Electrical',
    status: 'Available',
    experience: '8 years',
    phone: '+92 300 4444444',
    skills: ['Engine Repair', 'Electrical', 'Diagnostics'],
    coordinate: {latitude: 31.5154, longitude: 74.3527},
  },
  {
    id: 'm2',
    name: 'Muhammad Ali',
    rating: 4.7,
    jobs: 198,
    specialization: 'Tyre & Suspension',
    status: 'Busy',
    experience: '5 years',
    phone: '+92 300 5555555',
    skills: ['Tyre Change', 'Alignment', 'Suspension'],
    coordinate: {latitude: 31.5224, longitude: 74.3597},
  },
  {
    id: 'm3',
    name: 'Sajid Mehmood',
    rating: 4.5,
    jobs: 145,
    specialization: 'Brake Specialist',
    status: 'Available',
    experience: '6 years',
    phone: '+92 300 6666666',
    skills: ['Brake Pads', 'ABS', 'Clutch'],
    coordinate: {latitude: 31.5184, longitude: 74.3417},
  },
];

const mapDarkStyle = [
  {elementType: 'geometry', stylers: [{color: '#212121'}]},
  {elementType: 'labels.icon', stylers: [{visibility: 'off'}]},
  {elementType: 'labels.text.fill', stylers: [{color: '#757575'}]},
  {elementType: 'labels.text.stroke', stylers: [{color: '#212121'}]},
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{color: '#2c2c2c'}],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{color: '#373737'}],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{color: '#000000'}],
  },
];

/* ── Stars renderer ── */
const Stars = ({rating}: {rating: number}) => (
  <View style={{flexDirection: 'row', gap: 2}}>
    {[1, 2, 3, 4, 5].map(i => (
      <Star
        key={i}
        size={11}
        color={i <= Math.round(rating) ? '#F59E0B' : 'rgba(255,255,255,0.15)'}
        fill={i <= Math.round(rating) ? '#F59E0B' : 'transparent'}
        strokeWidth={1.5}
      />
    ))}
  </View>
);

/* ── Workshop Detail Modal ── */
const WorkshopDetailModal = ({
  workshop,
  visible,
  onClose,
}: {
  workshop: Workshop | null;
  visible: boolean;
  onClose: () => void;
}) => {
  if (!workshop) return null;
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={ms.backdrop}>
        <TouchableOpacity style={ms.flex} activeOpacity={1} onPress={onClose} />
        <View style={ms.sheet}>
          <View style={ms.indicator} />
          {/* Header */}
          <View style={ms.sheetHeader}>
            <View style={ms.sheetTitleRow}>
              <View style={ms.sheetIconBox}>
                <Wrench size={22} color="#E8490F" strokeWidth={2} />
              </View>
              <View style={{flex: 1}}>
                <Text style={ms.sheetTitle}>{workshop.name}</Text>
                <Text style={ms.sheetSub}>{workshop.address}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={ms.closeBtn}>
                <X size={18} color={Colors.GreyText} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>
          {/* Stats row */}
          <View style={ms.statsRow}>
            <View style={ms.statBox}>
              <Stars rating={workshop.rating} />
              <Text style={ms.statVal}>{workshop.rating}</Text>
              <Text style={ms.statLbl}>{workshop.reviews} reviews</Text>
            </View>
            <View style={ms.statDivider} />
            <View style={ms.statBox}>
              <MapPin size={16} color="#10B981" strokeWidth={2} />
              <Text style={ms.statVal}>{workshop.distance}</Text>
              <Text style={ms.statLbl}>Distance</Text>
            </View>
            <View style={ms.statDivider} />
            <View style={ms.statBox}>
              {workshop.open ? (
                <CheckCircle size={16} color="#10B981" strokeWidth={2} />
              ) : (
                <XCircle size={16} color="#EA4335" strokeWidth={2} />
              )}
              <Text
                style={[
                  ms.statVal,
                  {color: workshop.open ? '#10B981' : '#EA4335'},
                ]}>
                {workshop.open ? 'Open' : 'Closed'}
              </Text>
              <Text style={ms.statLbl}>
                {workshop.hours.split('·')[1]?.trim()}
              </Text>
            </View>
          </View>
          {/* Info rows */}
          <View style={ms.infoCard}>
            <View style={ms.infoRow}>
              <Clock size={16} color={Colors.GreyText} strokeWidth={1.8} />
              <Text style={ms.infoText}>{workshop.hours}</Text>
            </View>
            <View style={ms.infoRow}>
              <Phone size={16} color={Colors.GreyText} strokeWidth={1.8} />
              <Text style={ms.infoText}>{workshop.phone}</Text>
            </View>
            <View style={[ms.infoRow, {borderBottomWidth: 0}]}>
              <MapPinned size={16} color={Colors.GreyText} strokeWidth={1.8} />
              <Text style={ms.infoText}>{workshop.address}</Text>
            </View>
          </View>
          {/* Services */}
          <Text style={ms.servicesLabel}>Services Offered</Text>
          <View style={ms.servicesWrap}>
            {workshop.services.map(s => (
              <View key={s} style={ms.serviceChip}>
                <CheckCircle size={11} color="#E8490F" strokeWidth={2.5} />
                <Text style={ms.serviceChipText}>{s}</Text>
              </View>
            ))}
          </View>
          {/* Actions */}
          <View style={ms.actionRow}>
            <TouchableOpacity style={ms.callBtn} activeOpacity={0.8}>
              <Phone size={17} color="#FFFFFF" strokeWidth={2} />
              <Text style={ms.callBtnText}>Call Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={ms.bookBtn} activeOpacity={0.85}>
              <Text style={ms.bookBtnText}>Book Appointment</Text>
              <ChevronRight size={16} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/* ── Mechanic Detail Modal ── */
const MechanicDetailModal = ({
  mechanic,
  visible,
  onClose,
}: {
  mechanic: Mechanic | null;
  visible: boolean;
  onClose: () => void;
}) => {
  if (!mechanic) return null;
  const isAvailable = mechanic.status === 'Available';
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={ms.backdrop}>
        <TouchableOpacity style={ms.flex} activeOpacity={1} onPress={onClose} />
        <View style={ms.sheet}>
          <View style={ms.indicator} />
          <View style={ms.sheetHeader}>
            <View style={ms.sheetTitleRow}>
              <View
                style={[
                  ms.sheetIconBox,
                  {
                    backgroundColor: isAvailable
                      ? 'rgba(16,185,129,0.12)'
                      : 'rgba(232,73,15,0.12)',
                  },
                ]}>
                <Award
                  size={22}
                  color={isAvailable ? '#10B981' : '#E8490F'}
                  strokeWidth={2}
                />
              </View>
              <View style={{flex: 1}}>
                <Text style={ms.sheetTitle}>{mechanic.name}</Text>
                <Text style={ms.sheetSub}>{mechanic.specialization}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={ms.closeBtn}>
                <X size={18} color={Colors.GreyText} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>
          {/* Status + stats */}
          <View
            style={[
              ms.statusBanner,
              {
                borderColor: isAvailable
                  ? 'rgba(16,185,129,0.2)'
                  : 'rgba(232,73,15,0.2)',
                backgroundColor: isAvailable
                  ? 'rgba(16,185,129,0.06)'
                  : 'rgba(232,73,15,0.06)',
              },
            ]}>
            <View
              style={[
                ms.statusDot,
                {backgroundColor: isAvailable ? '#10B981' : '#E8490F'},
              ]}
            />
            <Text
              style={[
                ms.statusText,
                {color: isAvailable ? '#10B981' : '#E8490F'},
              ]}>
              {mechanic.status}
            </Text>
            <Text style={ms.statusSep}>·</Text>
            <Text style={ms.expText}>{mechanic.experience} experience</Text>
          </View>
          <View style={ms.statsRow}>
            <View style={ms.statBox}>
              <Stars rating={mechanic.rating} />
              <Text style={ms.statVal}>{mechanic.rating}</Text>
              <Text style={ms.statLbl}>Rating</Text>
            </View>
            <View style={ms.statDivider} />
            <View style={ms.statBox}>
              <CheckCircle size={16} color="#10B981" strokeWidth={2} />
              <Text style={ms.statVal}>{mechanic.jobs}</Text>
              <Text style={ms.statLbl}>Jobs Done</Text>
            </View>
            <View style={ms.statDivider} />
            <View style={ms.statBox}>
              <Clock size={16} color="#3B82F6" strokeWidth={2} />
              <Text style={ms.statVal}>{mechanic.experience}</Text>
              <Text style={ms.statLbl}>Exp</Text>
            </View>
          </View>
          {/* Skills */}
          <Text style={ms.servicesLabel}>Skills & Specializations</Text>
          <View style={ms.servicesWrap}>
            {mechanic.skills.map(s => (
              <View key={s} style={ms.serviceChip}>
                <CheckCircle size={11} color="#E8490F" strokeWidth={2.5} />
                <Text style={ms.serviceChipText}>{s}</Text>
              </View>
            ))}
          </View>
          {/* Actions */}
          <View style={ms.actionRow}>
            <TouchableOpacity style={ms.callBtn} activeOpacity={0.8}>
              <MessageCircle size={17} color="#FFFFFF" strokeWidth={2} />
              <Text style={ms.callBtnText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[ms.bookBtn, !isAvailable && {opacity: 0.4}]}
              activeOpacity={0.85}
              disabled={!isAvailable}>
              <Text style={ms.bookBtnText}>
                {isAvailable ? 'Request Mechanic' : 'Currently Busy'}
              </Text>
              {isAvailable && (
                <ChevronRight size={16} color="#FFFFFF" strokeWidth={2.5} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/* ── Main Explore Screen ── */
export const Explore: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(
    null,
  );
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(
    null,
  );
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const toggleFilter = (id: string) =>
    setActiveFilters(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id],
    );

  const filteredWorkshops = mockWorkshops.filter(w => {
    const q = searchQuery.toLowerCase();
    if (
      !w.name.toLowerCase().includes(q) &&
      !w.address.toLowerCase().includes(q)
    )
      return false;
    if (activeFilters.includes('distance') && parseFloat(w.distance) >= 2.0)
      return false;
    if (activeFilters.includes('rating') && w.rating < 4.5) return false;
    if (activeFilters.includes('availability') && !w.open) return false;
    return true;
  });

  const filteredMechanics = mockMechanics.filter(m => {
    const q = searchQuery.toLowerCase();
    if (
      !m.name.toLowerCase().includes(q) &&
      !m.specialization.toLowerCase().includes(q)
    )
      return false;
    if (activeFilters.includes('rating') && m.rating < 4.7) return false;
    if (activeFilters.includes('availability') && m.status !== 'Available')
      return false;
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      {' '}
      {/* ── Top Header ── */}
      <View style={styles.topHeader}>
        <View style={styles.searchBarContainer}>
          <Search
            size={18}
            color={Colors.GreyText}
            strokeWidth={1.8}
            style={{marginRight: 10}}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search mechanics, workshops, services…"
            placeholderTextColor={Colors.Grey}
            value={searchQuery}
            onChangeText={setSearchQuery}
            selectionColor="#E8490F"
          />
          {searchQuery ? (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearBtn}>
              <X size={15} color={Colors.GreyText} strokeWidth={2} />
            </TouchableOpacity>
          ) : null}
        </View>
        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}>
          {[
            {id: 'distance', label: '< 2 km', IconC: MapPin},
            {id: 'rating', label: 'Top Rated', IconC: Star},
            {id: 'availability', label: 'Available', IconC: CheckCircle},
          ].map(({id, label, IconC}) => {
            const active = activeFilters.includes(id);
            return (
              <TouchableOpacity
                key={id}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => toggleFilter(id)}
                activeOpacity={0.7}>
                <IconC
                  size={12}
                  color={active ? '#E8490F' : Colors.GreyText}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    active && styles.filterChipTextActive,
                  ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={styles.filterChip} activeOpacity={0.7}>
            <SlidersHorizontal
              size={12}
              color={Colors.GreyText}
              strokeWidth={1.8}
            />
            <Text style={styles.filterChipText}>More</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Map Preview */}
        <View style={styles.mapContainer}>
          <MapView
            style={StyleSheet.absoluteFillObject}
            userInterfaceStyle="dark"
            initialRegion={{
              latitude: 31.5204,
              longitude: 74.3587,
              latitudeDelta: 0.04,
              longitudeDelta: 0.04,
            }}
            customMapStyle={mapDarkStyle}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}>
            <Marker coordinate={{latitude: 31.5204, longitude: 74.3587}}>
              <View style={styles.userDot} />
            </Marker>
            {filteredWorkshops.map(w => (
              <Marker key={w.id} coordinate={w.coordinate}>
                <View style={styles.mapMarker}>
                  <Wrench size={12} color="#FFF" strokeWidth={2.5} />
                </View>
              </Marker>
            ))}
            {filteredMechanics.map(m => (
              <Marker key={m.id} coordinate={m.coordinate}>
                <View style={[styles.mapMarker, {backgroundColor: '#E8490F'}]}>
                  <Award size={12} color="#FFF" strokeWidth={2.5} />
                </View>
              </Marker>
            ))}
          </MapView>
          <View style={styles.mapOverlay}>
            <View style={styles.mapOverlayLeft}>
              <MapPinned size={14} color="#E8490F" strokeWidth={2} />
              <Text style={styles.mapLabel}>Nearby Helpers</Text>
            </View>
            <View style={styles.mapLegend}>
              <View style={styles.legendDot} />
              <Text style={styles.legendText}>Workshop</Text>
              <View
                style={[
                  styles.legendDot,
                  {backgroundColor: '#E8490F', marginLeft: 8},
                ]}
              />
              <Text style={styles.legendText}>Mechanic</Text>
            </View>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}>
          {categories.map(({id, name, Icon, color}) => {
            const active = activeCategory === id;
            return (
              <TouchableOpacity
                key={id}
                style={[
                  styles.categoryCard,
                  active && {borderColor: color, backgroundColor: `${color}18`},
                ]}
                activeOpacity={0.8}
                onPress={() => setActiveCategory(active ? null : id)}>
                <View
                  style={[
                    styles.categoryIconWrap,
                    {backgroundColor: `${color}20`},
                  ]}>
                  <Icon size={20} color={color} strokeWidth={2} />
                </View>
                <Text style={[styles.categoryName, active && {color: color}]}>
                  {name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Nearby Workshops */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Workshops</Text>
          <Text style={styles.sectionCount}>
            {filteredWorkshops.length} found
          </Text>
        </View>
        {filteredWorkshops.length === 0 ? (
          <View style={styles.emptyCard}>
            <Search size={28} color={Colors.GreyText} strokeWidth={1.5} />
            <Text style={styles.emptyText}>
              No workshops match your filters
            </Text>
          </View>
        ) : (
          filteredWorkshops.map(w => (
            <TouchableOpacity
              key={w.id}
              style={styles.workshopCard}
              activeOpacity={0.85}
              onPress={() => setSelectedWorkshop(w)}>
              <View style={styles.cardRow}>
                <View style={styles.workshopIconWrap}>
                  <Wrench size={22} color="#E8490F" strokeWidth={2} />
                </View>
                <View style={styles.cardTextWrap}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.workshopName} numberOfLines={1}>
                      {w.name}
                    </Text>
                    <View
                      style={[
                        styles.openBadge,
                        {
                          backgroundColor: w.open
                            ? 'rgba(16,185,129,0.1)'
                            : 'rgba(234,67,53,0.1)',
                        },
                      ]}>
                      {w.open ? (
                        <CheckCircle
                          size={11}
                          color="#10B981"
                          strokeWidth={2.5}
                        />
                      ) : (
                        <XCircle size={11} color="#EA4335" strokeWidth={2.5} />
                      )}
                      <Text
                        style={[
                          styles.openBadgeText,
                          {color: w.open ? '#10B981' : '#EA4335'},
                        ]}>
                        {w.open ? 'Open' : 'Closed'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.ratingRow}>
                    <Star
                      size={12}
                      color="#F59E0B"
                      fill="#F59E0B"
                      strokeWidth={1.5}
                    />
                    <Text style={styles.ratingVal}>{w.rating}</Text>
                    <Text style={styles.ratingReviews}>({w.reviews})</Text>
                    <View style={styles.dot} />
                    <MapPin
                      size={12}
                      color={Colors.GreyText}
                      strokeWidth={1.8}
                    />
                    <Text style={styles.distanceText}>{w.distance}</Text>
                  </View>
                  <Text style={styles.addressText} numberOfLines={1}>
                    {w.address}
                  </Text>
                </View>
                <ChevronRight
                  size={18}
                  color={Colors.GreyText}
                  strokeWidth={1.8}
                />
              </View>
              <View style={styles.tagsRow}>
                {w.services.slice(0, 3).map(s => (
                  <View key={s} style={styles.tagChip}>
                    <Text style={styles.tagText}>{s}</Text>
                  </View>
                ))}
                {w.services.length > 3 && (
                  <View style={styles.tagChip}>
                    <Text style={styles.tagText}>+{w.services.length - 3}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Top Rated Mechanics */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Rated Mechanics</Text>
          <Text style={styles.sectionCount}>
            {filteredMechanics.length} found
          </Text>
        </View>
        {filteredMechanics.length === 0 ? (
          <View style={styles.emptyCard}>
            <Award size={28} color={Colors.GreyText} strokeWidth={1.5} />
            <Text style={styles.emptyText}>
              No mechanics match your filters
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.mechanicScroll}
            contentContainerStyle={styles.mechanicScrollContent}>
            {filteredMechanics.map(m => {
              const isAvail = m.status === 'Available';
              return (
                <TouchableOpacity
                  key={m.id}
                  style={styles.mechanicCard}
                  activeOpacity={0.85}
                  onPress={() => setSelectedMechanic(m)}>
                  <View style={styles.mechanicCardTop}>
                    <View
                      style={[
                        styles.mechanicAvatarWrap,
                        {borderColor: isAvail ? '#10B981' : '#E8490F'},
                      ]}>
                      <Text style={styles.mechanicInitials}>
                        {m.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.availBadge,
                        {
                          backgroundColor: isAvail
                            ? 'rgba(16,185,129,0.1)'
                            : 'rgba(232,73,15,0.1)',
                        },
                      ]}>
                      <View
                        style={[
                          styles.availDot,
                          {backgroundColor: isAvail ? '#10B981' : '#E8490F'},
                        ]}
                      />
                      <Text
                        style={[
                          styles.availText,
                          {color: isAvail ? '#10B981' : '#E8490F'},
                        ]}>
                        {m.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.mechanicName} numberOfLines={1}>
                    {m.name}
                  </Text>
                  <Text style={styles.mechanicSpec} numberOfLines={1}>
                    {m.specialization}
                  </Text>
                  <View style={styles.mechanicRatingRow}>
                    <Star
                      size={12}
                      color="#F59E0B"
                      fill="#F59E0B"
                      strokeWidth={1.5}
                    />
                    <Text style={styles.mechanicRatingVal}>{m.rating}</Text>
                    <Text style={styles.mechanicJobs}>· {m.jobs} jobs</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>
      <WorkshopDetailModal
        workshop={selectedWorkshop}
        visible={selectedWorkshop !== null}
        onClose={() => setSelectedWorkshop(null)}
      />
      <MechanicDetailModal
        mechanic={selectedMechanic}
        visible={selectedMechanic !== null}
        onClose={() => setSelectedMechanic(null)}
      />
    </SafeAreaView>
  );
};

export default Explore;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgColor,
  },
  topHeader: {
    paddingHorizontal: WIDTH_BASE_RATIO(20),
    paddingTop:
      Platform.OS === 'android' ? HEIGHT_BASE_RATIO(44) : HEIGHT_BASE_RATIO(14),
    paddingBottom: HEIGHT_BASE_RATIO(12),
    backgroundColor: Colors.bgColor,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: WIDTH_BASE_RATIO(16),
    paddingHorizontal: WIDTH_BASE_RATIO(14),
    height: HEIGHT_BASE_RATIO(50),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: FONT_SIZE(14),
    color: Colors.White,
    paddingVertical: 0,
  },
  clearBtn: {padding: 4},
  filterScroll: {marginTop: 10},
  filterContent: {
    gap: WIDTH_BASE_RATIO(8),
    paddingRight: WIDTH_BASE_RATIO(4),
  },

  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WIDTH_BASE_RATIO(5),
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: WIDTH_BASE_RATIO(10),
    paddingHorizontal: WIDTH_BASE_RATIO(11),
    paddingVertical: HEIGHT_BASE_RATIO(7),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(232,73,15,0.1)',
    borderColor: '#E8490F',
  },
  filterChipText: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 12,
    color: Colors.GreyText,
  },
  filterChipTextActive: {color: '#E8490F'},
  scrollContainer: {flex: 1},
  scrollContent: {paddingHorizontal: 20, paddingTop: 16},
  mapContainer: {
    height: HEIGHT_BASE_RATIO(170),
    borderRadius: WIDTH_BASE_RATIO(22),
    overflow: 'hidden',
    marginBottom: HEIGHT_BASE_RATIO(24),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  userDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#3B82F6',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  mapMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(3,0,5,0.78)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapOverlayLeft: {flexDirection: 'row', alignItems: 'center', gap: 6},
  mapLabel: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 13,
    color: Colors.White,
  },
  mapLegend: {flexDirection: 'row', alignItems: 'center', gap: 4},
  legendDot: {width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981'},
  legendText: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 11,
    color: Colors.GreyText,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: FONT_SIZE(19),
    color: Colors.White,
  },
  sectionCount: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 13,
    color: Colors.GreyText,
  },
  categoryScroll: {marginBottom: 24, marginHorizontal: -20},
  categoryContent: {paddingHorizontal: 20, gap: 10},
  categoryCard: {
    width: WIDTH_BASE_RATIO(86),
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: WIDTH_BASE_RATIO(18),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    paddingVertical: HEIGHT_BASE_RATIO(14),
    alignItems: 'center',
  },
  categoryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 12,
    color: Colors.White,
  },
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  emptyText: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 14,
    color: Colors.GreyText,
  },
  workshopCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: WIDTH_BASE_RATIO(20),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    padding: WIDTH_BASE_RATIO(16),
    marginBottom: HEIGHT_BASE_RATIO(14),
  },
  cardRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 12},
  workshopIconWrap: {
    width: WIDTH_BASE_RATIO(50),
    height: HEIGHT_BASE_RATIO(50),
    borderRadius: WIDTH_BASE_RATIO(16),
    backgroundColor: 'rgba(232,73,15,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: WIDTH_BASE_RATIO(14),
  },
  cardTextWrap: {flex: 1, marginRight: 8},
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  workshopName: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 15,
    color: Colors.White,
    flex: 1,
    marginRight: 8,
  },
  openBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
  },
  openBadgeText: {fontFamily: FontFamily.UrbanistBold, fontSize: 10},
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  ratingVal: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 13,
    color: Colors.White,
  },
  ratingReviews: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 12,
    color: Colors.GreyText,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  distanceText: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 12,
    color: Colors.GreyText,
  },
  addressText: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 12,
    color: Colors.GreyText,
  },
  tagsRow: {flexDirection: 'row', gap: 7, flexWrap: 'wrap'},
  tagChip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: WIDTH_BASE_RATIO(10),
    paddingVertical: HEIGHT_BASE_RATIO(5),
    borderRadius: WIDTH_BASE_RATIO(8),
  },
  tagText: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 11,
    color: Colors.GreyText,
  },
  mechanicScroll: {marginBottom: 24, marginHorizontal: -20},
  mechanicScrollContent: {paddingHorizontal: 20, gap: 12},
  mechanicCard: {
    width: WIDTH_BASE_RATIO(170),
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: WIDTH_BASE_RATIO(22),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    padding: WIDTH_BASE_RATIO(16),
  },
  mechanicCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  mechanicAvatarWrap: {
    width: WIDTH_BASE_RATIO(48),
    height: HEIGHT_BASE_RATIO(48),
    borderRadius: WIDTH_BASE_RATIO(16),
    backgroundColor: 'rgba(232,73,15,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  mechanicInitials: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 16,
    color: '#E8490F',
  },
  availBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  availDot: {width: 6, height: 6, borderRadius: 3},
  availText: {fontFamily: FontFamily.UrbanistBold, fontSize: 10},
  mechanicName: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 15,
    color: Colors.White,
    marginBottom: 2,
  },
  mechanicSpec: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 12,
    color: Colors.GreyText,
    marginBottom: 10,
  },
  mechanicRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 8,
  },
  mechanicRatingVal: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 13,
    color: Colors.White,
  },
  mechanicJobs: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 11,
    color: Colors.GreyText,
  },
  bottomSpacer: {height: 100},
});

const ms = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(3,0,5,0.78)',
    justifyContent: 'flex-end',
  },
  flex: {flex: 1},
  sheet: {
    backgroundColor: '#0D0D12',
    borderTopLeftRadius: WIDTH_BASE_RATIO(28),
    borderTopRightRadius: WIDTH_BASE_RATIO(28),
    paddingTop: HEIGHT_BASE_RATIO(8),
    paddingBottom:
      Platform.OS === 'ios' ? HEIGHT_BASE_RATIO(36) : HEIGHT_BASE_RATIO(28),
    paddingHorizontal: WIDTH_BASE_RATIO(20),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  indicator: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 18,
  },
  sheetHeader: {marginBottom: 18},
  sheetTitleRow: {flexDirection: 'row', alignItems: 'center', gap: 12},
  sheetIconBox: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: 'rgba(232,73,15,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetTitle: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 18,
    color: Colors.White,
    marginBottom: 2,
  },
  sheetSub: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 13,
    color: Colors.GreyText,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  statBox: {flex: 1, alignItems: 'center', gap: 4},
  statVal: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 16,
    color: Colors.White,
  },
  statLbl: {
    fontFamily: FontFamily.UrbanistRegular,
    fontSize: 11,
    color: Colors.GreyText,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  infoText: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 14,
    color: Colors.White,
    flex: 1,
  },
  servicesLabel: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 15,
    color: Colors.White,
    marginBottom: 10,
  },
  servicesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  serviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(232,73,15,0.08)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(232,73,15,0.15)',
  },
  serviceChipText: {
    fontFamily: FontFamily.UrbanistSemiBold,
    fontSize: 12,
    color: '#E8490F',
  },
  actionRow: {flexDirection: 'row', gap: 10},
  callBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callBtnText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 13,
    color: Colors.White,
  },
  bookBtn: {
    flex: 1,
    height: HEIGHT_BASE_RATIO(52),
    borderRadius: WIDTH_BASE_RATIO(16),
    backgroundColor: '#E8490F',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: WIDTH_BASE_RATIO(6),
  },
  bookBtnText: {
    fontFamily: FontFamily.UrbanistBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  statusDot: {width: 8, height: 8, borderRadius: 4},
  statusText: {fontFamily: FontFamily.UrbanistBold, fontSize: 14},
  statusSep: {color: 'rgba(255,255,255,0.2)', fontSize: 14},
  expText: {
    fontFamily: FontFamily.UrbanistMedium,
    fontSize: 13,
    color: Colors.GreyText,
  },
});
