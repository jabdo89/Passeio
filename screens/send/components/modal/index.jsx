/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { Button, Input, Text, RadioGroup, Radio } from '@ui-kitten/components';
import BottomModal from '../../../../templates/bottom-modal';
import { Title } from './elements';

const BoolModal = ({ visible, onClose, item, cart, setCart, removeFromCart }) => {
  const [value, setValue] = useState({ price: '', weigth: '', category: '' });
  const [categoriesIndex, setCategoriesIndex] = useState(0);

  const categories = [
    { name: 'Otro', value: 0 },
    { name: 'Smartwatch', value: 35.0 },
    { name: 'Celular', value: 50.0 },
    { name: 'Laptop', value: 55.0 },
    { name: 'Consola de VideoJuegos', value: 60.0 },
    { name: 'Tablet', value: 50.0 },
    { name: 'Camara', value: 40.0 },
    { name: 'Audifonos', value: 25.0 },
  ];

  const save = () => {
    const temp = cart;
    let newData = {};
    if (!item.item.weigth) {
      newData = { ...newData, weigth: value.weigth };
    }
    newData = { ...newData, category: categories[categoriesIndex] };

    if (!item.item.prices[0]) {
      newData = { ...newData, prices: [{ price: value.price }] };
    }
    temp[item.index] = { ...item.item, ...newData };
    setCart(temp);
    setValue({ price: '', weigth: '', category: '' });
    onClose();
  };

  const remove = () => {
    removeFromCart(item.index);
    onClose();
  };

  return (
    <BottomModal
      visible={visible}
      onClose={onClose}
      style={{ minHeight: 400, backgroundColor: 'red' }}
    >
      <Title category="h6">Llene la Informacion Faltante</Title>
      {item.item && !item.item.weigth ? (
        <Input
          keyboardType="numeric"
          style={{ marginTop: 10, marginBottom: 10 }}
          size="large"
          onChangeText={(nextValue) => setValue({ ...value, weigth: nextValue })}
          value={value.weigth}
          placeholder="Peso del producto (Libras)"
        />
      ) : null}
      {item.item && !item.item.prices[0] ? (
        <Input
          keyboardType="numeric"
          style={{ marginTop: 10, marginBottom: 10 }}
          size="large"
          onChangeText={(nextValue) => setValue({ ...value, price: nextValue })}
          value={value.price}
          placeholder="Precio del producto (USD)"
        />
      ) : null}
      <>
        <Text style={{ marginTop: 5, marginBottom: 10, fontWeight: '700' }}>
          Selecione la Categoria del Producto
        </Text>
        <RadioGroup
          size="large"
          style={{ marginBottom: 15 }}
          selectedIndex={categoriesIndex}
          onChange={(index) => setCategoriesIndex(index)}
        >
          {categories.map((category) => {
            return <Radio>{category.name}</Radio>;
          })}
        </RadioGroup>
      </>
      <Button onPress={save} disabled={!item?.item?.weigth && !value.weigth}>
        Guardar
      </Button>
      <Button appearance="ghost" style={{ marginTop: 10 }} onPress={remove}>
        <Text style={{ color: 'red' }}>Eliminar de Carrito</Text>
      </Button>
    </BottomModal>
  );
};

export default BoolModal;
