package handler

import (
	"reflect"
	"strings"
)

func buildUpdatesFromDTO(req interface{}) map[string]interface{} {
	updates := map[string]interface{}{}
	val := reflect.ValueOf(req)
	if val.Kind() == reflect.Ptr {
		if val.IsNil() {
			return updates
		}
		val = val.Elem()
	}
	if val.Kind() != reflect.Struct {
		return updates
	}

	typ := val.Type()
	for i := 0; i < val.NumField(); i++ {
		field := val.Field(i)
		if field.Kind() != reflect.Ptr || field.IsNil() {
			continue
		}

		tag := typ.Field(i).Tag.Get("json")
		if tag == "" || tag == "-" {
			continue
		}
		name := strings.Split(tag, ",")[0]
		if name == "" {
			continue
		}

		updates[name] = field.Elem().Interface()
	}

	return updates
}
