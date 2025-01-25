"use client";

import { useState, useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  Pin,
} from "@vis.gl/react-google-maps";
import axios from "axios";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  senderName: z.string().min(1, { message: "This field is required!" }),
  senderNumber: z
    .string()
    .min(9, { message: "Please enter a valid phone number" }),
  pickup: z.string().nonempty({ message: "This field is required!" }),
  receiverName: z.string().min(1, { message: "This field is required!" }),
  receiverNumber: z
    .string()
    .min(9, { message: "Please enter a valid phone number" }),
  destination: z.string().nonempty({ message: "This field is required!" }),
  package: z.string().nonempty({ message: "This field is required!" }),
});

const MapWithSearch = ({
  pickupLoc,
  setPickupLoc,
  destLoc,
  setDestLoc,
  result,
  setResult,
  markerPosition,
  setMarkerPosition,
  markerTwoPosition,
  setMarkerTwoPosition,
  setValue,
}) => {
  const map = useMap();
  const [pickupError, setPickupError] = useState(""); // Separate state for pickup error
  const [destError, setDestError] = useState(""); // Separate state for destination error

  const handleSearchPickup = async (e) => {
    e.preventDefault();
    setPickupError(""); // Reset error before new search

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${pickupLoc}&key=${process.env.NEXT_PUBLIC_MAPS_API}`
      );

      if (!response.data.results || response.data.results.length === 0) {
        throw new Error("Pickup location not found, please try again.");
      }

      const location = response.data.results[0].geometry.location;
      const formattedAddress = response.data.results[0].formatted_address;

      // Update map location and marker position
      setResult({
        lat: location.lat,
        lon: location.lng,
        display: formattedAddress,
      });
      setMarkerPosition({ lat: location.lat, lng: location.lng });

      // Pan the map to the new location if the map instance exists
      if (map) {
        map.panTo(new google.maps.LatLng(location.lat, location.lng));
      }

      // Update the pickup field in the form
      setValue("pickup", formattedAddress);
    } catch (error) {
      setPickupError(
        error.message || "An unexpected error occurred. Please try again."
      );
    }
  };

  const handleSearchDest = async (e) => {
    e.preventDefault();
    setDestError(""); // Reset error before new search

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${destLoc}&key=${process.env.NEXT_PUBLIC_MAPS_API}`
      );

      if (!response.data.results || response.data.results.length === 0) {
        throw new Error("Destination location not found, please try again.");
      }

      const location = response.data.results[0].geometry.location;
      const formattedAddress = response.data.results[0].formatted_address;

      // Update map location and marker position
      setResult({
        lat: location.lat,
        lon: location.lng,
        display: formattedAddress,
      });
      setMarkerTwoPosition({ lat: location.lat, lng: location.lng });

      // Pan the map to the new location if the map instance exists
      if (map) {
        map.panTo(new google.maps.LatLng(location.lat, location.lng));
      }

      // Update the destination field in the form
      setValue("destination", formattedAddress);
    } catch (error) {
      setDestError(
        error.message || "An unexpected error occurred. Please try again."
      );
    }
  };

  return (
    <div className="w-96 border p-4 rounded-md shadow-lg flex flex-col gap-3">
      <h1>Enter pickup location</h1>
      {pickupError && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{pickupError}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSearchPickup} className="flex">
        <Input
          type="text"
          className="rounded-none"
          value={pickupLoc}
          onChange={(e) => setPickupLoc(e.target.value)}
        />
        <Button type="submit" className="rounded-none">
          Find
        </Button>
      </form>

      <h1>Enter destination</h1>
      {destError && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{destError}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSearchDest} className="flex">
        <Input
          type="text"
          className="rounded-none"
          value={destLoc}
          onChange={(e) => setDestLoc(e.target.value)}
        />
        <Button type="submit" className="rounded-none">
          Find
        </Button>
      </form>

      <Map
        mapId="bd607af67d5b8861"
        defaultCenter={markerPosition}
        defaultZoom={13}
        style={{ width: "100%", height: "16rem" }}
        disableDefaultUI={true}
      >
        <AdvancedMarker position={markerPosition}>
          <Pin
            background={"#FF0000"}// Dark red border
            glyphColor={"#FFFFFF"} // White text color
            glyph={"A"} // Set label "A"
          />
        </AdvancedMarker>

        <AdvancedMarker position={markerTwoPosition}>
          <Pin
            background={"#0000FF"} // Blue color for destination
            borderColor={"none"} 
            glyphColor={"#FFFFFF"} // White text color
            glyph={"B"} // Set label "B"
          />
        </AdvancedMarker>
      </Map>

      <p>Latitude: {result.lat}</p>
      <p>Longitude: {result.lon}</p>
      <p>Display: {result.display}</p>
    </div>
  );
};

export default function Home() {
  const [pickupLoc, setPickupLoc] = useState("");
  const [destLoc, setDestLoc] = useState("");
  const [result, setResult] = useState({
    lat: -7.2574719,
    lon: 112.7520883,
    display: "Surabaya, East Java, Indonesia",
  });
  const [markerPosition, setMarkerPosition] = useState({
    lat: -7.2574719,
    lng: 112.7520883,
  });
  const [markerTwoPosition, setMarkerTwoPosition] = useState({
    lat: -7.2574719,
    lng: 112.7520883,
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      senderName: "",
      senderNumber: "",
      pickup: "",
      receiverName: "",
      receiverNumber: "",
      destination: "",
      package: "",
    },
  });

  const { setValue } = form;

  const handleSubmit = (data) => {
    console.log({
      ...data,
      pickupLat: markerPosition.lat,  // Pickup latitude
      pickupLng: markerPosition.lng,  // Pickup longitude
      destinationLat: markerTwoPosition.lat,  // Destination latitude
      destinationLng: markerTwoPosition.lng,
    });
  };

  return (
    <>
    <div>
      <h1 className="font-bold text-2xl text-center mt-6">Dynamits Delivery Order</h1>
    </div>
    <div className="min-h-screen w-full flex flex-col md:flex-row items-center justify-center py-10 gap-16">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="border w-96 p-4 rounded-md shadow-lg flex flex-col gap-3"
        >
          <FormField
            control={form.control}
            name="senderName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sender's Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter sender's name"
                    type="text"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="senderNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sender's Phone Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter sender's phone number"
                    type="text"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pickup"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pickup Location</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Search on the maps"
                    type="text"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="receiverName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Receiver's Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter receiver's name"
                    type="text"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="receiverNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Receiver's Phone Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter receiver's phone number"
                    type="text"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Search on the maps"
                    type="text"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="package"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Package Description</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. foods, clothes, document"
                    type="text"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Order
          </Button>
        </form>
      </Form>

      <APIProvider apiKey={process.env.NEXT_PUBLIC_MAPS_API}>
        <MapWithSearch
          pickupLoc={pickupLoc}
          setPickupLoc={setPickupLoc}
          destLoc={destLoc}
          setDestLoc={setDestLoc}
          result={result}
          setResult={setResult}
          markerPosition={markerPosition}
          setMarkerPosition={setMarkerPosition}
          markerTwoPosition={markerTwoPosition}
          setMarkerTwoPosition={setMarkerTwoPosition}
          setValue={setValue}
        />
      </APIProvider>
    </div>
    </>
  );
}
