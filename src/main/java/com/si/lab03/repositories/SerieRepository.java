package com.si.lab03.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.si.lab03.entities.Serie;


@Repository
public interface SerieRepository extends JpaRepository<Serie, Integer> {

}